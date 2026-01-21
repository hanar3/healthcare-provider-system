
import { Elysia, t } from 'elysia';
import {
	and,
	count,
	desc,
	eq,
	ilike,
	sql
} from 'drizzle-orm';
import { db } from '../db';
import { profile, profileClinicAccess, profileSpecialties, specialties } from '../db/schema';
import { decrypt, encrypt } from '../lib/crypto';
import { emailExists } from '../plugins/emailExistsPlugin';

const createDoctorDTO = t.Object({
	name: t.String(),
	email: t.String(),
	govId: t.Optional(t.String()),
	specialties: t.Optional(t.Array(t.String())),
	clinicId: t.Optional(t.String())
});

const updateDoctorDTO = t.Partial(createDoctorDTO);

const doctorListBaseFilters = [
	eq(profile.role, 'doctor'),
];

const doctorBaseSelect = {
	id: profile.id,
	name: profile.name,
	email: profile.email,
	status: profile.status,
	plan: profile.plan,
	govId: profile.govId,
	clinicId: profileClinicAccess.clinicId,
	specialties: sql<{ id: string; name: string }[]>`
    coalesce(
      json_agg(
        json_build_object(
          'id', ${specialties.id},
          'name', ${specialties.name},
          'slug', ${specialties.slug}
        )
      ) filter (where ${specialties.id} is not null),
      '[]'
    )
  `,
	createdAt: profile.createdAt,
	updatedAt: profile.updatedAt,
}

export const doctorsController = new Elysia({ prefix: '/doctors' })
	.use(emailExists)
	.get('/', async ({ query: { page, limit, ...f } }) => {
		const baseQuery = db.select({ ...doctorBaseSelect })
			.from(profile)
			.leftJoin(profileClinicAccess, eq(profile.id, profileClinicAccess.profileId))
			.leftJoin(profileSpecialties, eq(profile.id, profileSpecialties.profileId))
			.leftJoin(specialties, eq(profileSpecialties.specialtyId, specialties.id))
			.groupBy(profile.id, profileClinicAccess.clinicId);

		const filters = [...doctorListBaseFilters];
		if (f.clinicId) filters.push(eq(profileClinicAccess.clinicId, f.clinicId));

		if (f.govId) { // govId filter
			const encrypted = await encrypt(f.govId);
			filters.push(eq(profile.govId, `${encrypted.iv}:${encrypted.data}`));
		}

		if (f.name) filters.push(ilike(profile.name, `%${f.name}%`));


		const rows = await baseQuery.where(and(...filters)).limit(limit).offset(limit * page).orderBy(desc(profile.createdAt));;
		const [total] = await db.select({ count: count() }).from(profile).leftJoin(profileClinicAccess, eq(profile.id, profileClinicAccess.profileId)).where(and(...filters));



		const list = await Promise.all(rows.map(async profile => {
			if (!profile.govId) return profile;

			const parts = profile.govId.split(":");
			if (parts.length !== 2) return profile;

			const [iv, data] = parts as [string, string];
			const decrypted = await decrypt({ iv, data });
			return {
				...profile,
				govId: decrypted,
			}
		}));

		return {
			list,
			page,
			limit,
			totalPages: (total?.count ?? 0) / limit,
			total: total?.count ?? 0,
		}
	}, {
		query: t.Object({
			page: t.Number(),
			limit: t.Number({ maximum: 100 }),
			clinicId: t.Optional(t.String()),
			govId: t.Optional(t.String()),
			name: t.Optional(t.String())
		})
	})

	.get(
		'/:id',
		async ({ params: { id }, status }) => {
			const result = await db.select({ ...doctorBaseSelect })
				.from(profile)
				.leftJoin(profileClinicAccess, eq(profile.id, profileClinicAccess.profileId))
				.leftJoin(profileSpecialties, eq(profile.id, profileSpecialties.profileId))
				.leftJoin(specialties, eq(profileSpecialties.specialtyId, specialties.id))
				.where(eq(profile.id, id))
				.groupBy(profile.id, profileClinicAccess.clinicId);


			if (result.length === 0) {
				return status(404, 'profile not found');
			}

			const profileResult = result.at(0)!; // org is guaranteed to exist due to last check
			if (!profileResult.govId) return profileResult;
			const parts = profileResult.govId.split(":");
			if (parts.length !== 2) {
				console.warn(`profile: ${profileResult.id} isn't properly encrypted`); // todo: proper logging
				return profileResult;
			}
			const [iv, data] = parts as [string, string] // safe cast due to last check
			profileResult.govId = await decrypt({ iv, data });
			return profileResult;

		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	)

	.post(
		'/',
		async ({ body, status }) => {
			const payload = {
				...body
			};

			if (payload.govId) {
				const encryptedGovId = await encrypt(payload.govId);
				payload.govId = `${encryptedGovId.iv}:${encryptedGovId.data}`;
			}

			const result = await db.transaction(async () => {
				const [p] = await db.insert(profile).values({
					email: body.email,
					name: body.name,
					govId: payload.govId,
					role: "doctor"
				}).returning();

				if (body.specialties && p) {
					await db.insert(profileSpecialties).values(
						body.specialties.map(s => {
							return {
								profileId: p.id,
								specialtyId: s
							}
						})
					)
				}

				if (body.clinicId && p) {
					await db.insert(profileClinicAccess).values({
						profileId: p?.id,
						clinicId: body.clinicId,
					})
				}

				return p;
			});

			return result;
		},
		{
			conflictIfEmailExists: true,
			body: createDoctorDTO,
		}
	)

	.patch(
		'/:id',
		async ({ params: { id }, body, status }) => {
			const payload = { ...body };
			if (payload.govId) {
				const encryptedGovId = await encrypt(payload.govId);
				payload.govId = `${encryptedGovId.iv}:${encryptedGovId.data}`;
			}

			const result = await db
				.update(profile)
				.set(body)
				.where(eq(profile.id, id))
				.returning();

			if (body.specialties) { // TODO: this is BAD. we shouldn't do this.
				await db.delete(profileSpecialties).where(eq(profileSpecialties.profileId, id)); // remove all specialties for that profile
				// insert new ones
				await db.insert(profileSpecialties).values(
					body.specialties.map(s => {
						return {
							profileId: id,
							specialtyId: s
						}
					})
				)
			}

			if (result.length === 0) {
				return status(404, 'profile not found');
			}

			return result[0];
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: updateDoctorDTO,
		}
	)

	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			const result = await db
				.delete(profile)
				.where(eq(profile.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'profile not found');
			}

			return { success: true, deletedId: result[0]!.id };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
