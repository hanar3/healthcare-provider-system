import { Elysia, t } from 'elysia';
import { sql, desc, eq, and, inArray, gt, count } from 'drizzle-orm';
import { db } from '../db';
import { clinics, profile, profileClinicAccess, profileSpecialties, specialties } from '../db/schema';

export const searchController = new Elysia()
	.get('/search', async ({ query }) => {
		const { address, specialtySlugs } = query;

		const similarityCalc = sql<number>`similarity(${clinics.address}, ${address ?? ''})`;


		let specialtyFilter: any = undefined;

		let slugs = (Array.isArray(specialtySlugs) ? specialtySlugs : [specialtySlugs]).filter(Boolean) as string[];
		const specialtyIds = slugs.filter(Boolean).length > 0 ? await db.select({ id: specialties.id }).from(specialties).where(inArray(specialties.slug, slugs)) : [];

		if (specialtyIds) {
			const ids = specialtyIds.map(s => s.id);

			const matchingClinicsQuery = db
				.select({ id: profileClinicAccess.clinicId })
				.from(profileClinicAccess)
				.innerJoin(profile, eq(profileClinicAccess.profileId, profile.id))
				.innerJoin(profileSpecialties, eq(profile.id, profileSpecialties.profileId))
				.where(inArray(profileSpecialties.specialtyId, ids));

			specialtyFilter = inArray(clinics.id, matchingClinicsQuery);
		}


		const results = await db
			.select({
				id: clinics.id,
				name: clinics.name,
				address: clinics.address,
				relevance: address ? similarityCalc : sql<number>`1`,
				specialties: sql<{ id: string; name: string; slug: string }[]>`
				coalesce(
					json_agg(
						distinct jsonb_build_object(
							'id', ${specialties.id},
							'name', ${specialties.name},
							'slug', ${specialties.slug}
					)
				) filter (where ${specialties.id} is not null),
      '[]'
			)`,
			})
			.from(clinics)
			.leftJoin(profileClinicAccess, eq(clinics.id, profileClinicAccess.clinicId))
			.leftJoin(profile, eq(profileClinicAccess.profileId, profile.id))
			.leftJoin(profileSpecialties, eq(profile.id, profileSpecialties.profileId))
			.leftJoin(specialties, eq(profileSpecialties.specialtyId, specialties.id))
			.where(
				and(
					address ? gt(similarityCalc, 0.1) : undefined,
					specialtyFilter
				)
			)
			.groupBy(clinics.id)
			.orderBy(desc(address ? similarityCalc : clinics.createdAt));

		const [rowCount] = await db
			.select({
				total: count()
			})
			.from(clinics)
			.leftJoin(profileClinicAccess, eq(clinics.id, profileClinicAccess.clinicId))
			.leftJoin(profile, eq(profileClinicAccess.profileId, profile.id))
			.leftJoin(profileSpecialties, eq(profile.id, profileSpecialties.profileId))
			.leftJoin(specialties, eq(profileSpecialties.specialtyId, specialties.id))
			.where(
				and(
					address ? gt(similarityCalc, 0.1) : undefined,
					specialtyFilter
				)
			)
			.groupBy(clinics.id)
			.orderBy(desc(address ? similarityCalc : clinics.createdAt));

		return {
			list: results.map(r => ({
				...r,
				specialties: r.specialties.filter(Boolean)
			})),
			total: rowCount?.total
		}
	}, {
		query: t.Object({
			address: t.Optional(t.String()),
			specialtySlugs: t.Optional(t.Union([t.String(), t.Array(t.String())]))
		})
	});
