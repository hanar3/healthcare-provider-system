import { Elysia, t } from 'elysia';
import { db } from '../db';
import {
	clinics,
} from '../db/schema';
import { decrypt, encrypt } from '../lib/crypto';
import {
	and,
	count,
	desc,
	eq,
	ilike,
	inArray
} from 'drizzle-orm';
import { authPlugin } from '../plugins/authPlugin';
import { defineAbilityFor } from "@workspace/common/auth/ability";

const createClinicDTO = t.Object({
	name: t.String(),
	address: t.String(),
	govId: t.Optional(t.String()),
});

const updateClinicDTO = t.Partial(createClinicDTO);

export const clinicsController = new Elysia({ prefix: '/clinics' })
	.use(authPlugin)
	.post('/', async ({ body, profile, status }) => {
		const payload = { ...body };
		const rules = defineAbilityFor(profile);
		if (rules.cannot('create', 'Clinic')) {
			return status(401, 'Unauthorized')
		}

		if (payload.govId) {
			const { iv, data } = await encrypt(payload.govId);
			payload.govId = `${iv}:${data}`;
		}

		await db.insert(clinics).values(payload);
	}, {
		isSignedIn: true,
		body: t.Object({
			name: t.String(),
			address: t.String(),
			govId: t.Optional(t.String()),
		})
	})
	.get("/", async ({ query, profile, status }) => {
		const { page, limit } = query;
		const rules = defineAbilityFor(profile);

		const filters = [];

		if (rules.cannot('read', 'Clinic')) {
			return status(401, "Cannot list clinics");
		}

		if (query.name) {
			filters.push(ilike(clinics.name, `%${query.name}%`));
		}

		if (query.address) {
			filters.push(ilike(clinics.address, `%${query.name}%`));
		}

		if (profile.clinicAccessIds.length > 0) {
			filters.push(inArray(clinics.id, profile.clinicAccessIds))
		}

		const data = await db.select().from(clinics).where(and(...filters)).offset(page * limit).limit(limit).orderBy(desc(clinics.createdAt));
		const [total] = await db.select({ count: count() }).from(clinics).where(and(...filters));


		const list = await Promise.all(data.map(async d => {
			if (!d.govId) return d;

			const parts = d.govId.split(":");
			if (parts.length !== 2) return d;

			const [iv, data] = parts as [string, string];
			const decrypted = await decrypt({ iv, data });
			return {
				...d,
				govId: decrypted,
			}
		}));

		return {
			list,
			total: total?.count ?? 0,
		}
	}, {
		isSignedIn: true,
		query: t.Object({
			page: t.Number({ minimum: 0 }),
			limit: t.Number({ maximum: 100 }),
			name: t.Optional(t.String()),
			address: t.Optional(t.String()),
		})
	})
	.get(
		'/:id',
		async ({ params: { id }, status, profile }) => {
			const rules = defineAbilityFor(profile);

			if (rules.cannot('read', 'Clinic', id)) {
				return status(401, "You aren't authorized");
			}

			const result = await db
				.select()
				.from(clinics)
				.where(eq(clinics.id, id));

			if (result.length === 0) {
				return status(404, 'Clinic not found');
			}

			const org = result.at(0)!; // org is guaranteed to exist due to last check
			if (!org.govId) return org;
			const parts = org.govId.split(":");
			if (parts.length !== 2) {
				console.warn(`clinic: ${org.id} isn't properly encrypted`); // todo: proper logging
				return org;
			}
			const [iv, data] = parts as [string, string] // safe cast due to last check

			org.govId = await decrypt({ iv, data });
			return org;

		},
		{
			isSignedIn: true,
			params: t.Object({
				id: t.String(),
			}),
		}
	)
	.patch(
		'/:id',
		async ({ params: { id }, body, status, profile }) => {
			const rules = defineAbilityFor(profile);

			if (rules.cannot('update', 'Clinic', id)) {
				return status(401, "Unauthorized");
			}

			const result = await db

				.update(clinics)
				.set(body)
				.where(eq(clinics.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'Clinic not found');
			}

			return result[0];
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			isSignedIn: true,
			body: updateClinicDTO,
		}
	)
	.delete(
		'/:id',
		async ({ params: { id }, status, profile }) => {
			const rules = defineAbilityFor(profile);
			if (rules.cannot('delete', 'Clinic', id)) {
				return status(401, "Unauthorized");
			}

			try {
				const result = await db
					.delete(clinics)
					.where(eq(clinics.id, id))
					.returning();
				if (result.length === 0) {
					return status(404, 'Clinic not found');
				}

				return { success: true, deletedId: result[0]!.id };
			} catch (err) {
				console.error(err)
			}




		},
		{
			isSignedIn: true,
			params: t.Object({
				id: t.String(),
			}),
		}
	);
