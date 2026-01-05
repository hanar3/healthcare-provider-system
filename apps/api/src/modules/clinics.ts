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
	ilike 
} from 'drizzle-orm';

const createClinicDTO = t.Object({
	name: t.String(),
	address: t.String(),
	govId: t.Optional(t.String()), 
});

const updateClinicDTO = t.Partial(createClinicDTO);

export const clinicsController = new Elysia({ prefix: '/clinics' })
	.post('/', async ({ body }) => {
		const payload = { ...body };

		if (payload.govId) {
			const { iv, data } = await encrypt(payload.govId);
			payload.govId = `${iv}:${data}`;
		}

		await db.insert(clinics).values({
			name: body.name,
			address: body.address,
			govId: body.govId,
		});
	}, {
		body: t.Object({
			name: t.String(),
			address: t.String(),
			govId: t.Optional(t.String()), 
		})
	})	
	.get("/", async ({ query }) => {
		const { page, limit } = query;
	
		const filters = [];
		
		if (query.name) {
			filters.push(ilike(clinics.name, `%${query.name}%`));
		}

		if (query.address) {
			filters.push(ilike(clinics.address, `%${query.name}%`));
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
		query: t.Object({
			page: t.Number({ minimum: 0 }),
			limit: t.Number({ maximum: 100 }),
			name: t.Optional(t.String()),
			address: t.Optional(t.String()),
		})
	})
	.get(
		'/:id',
		async ({ params: { id }, status }) => {
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
			params: t.Object({
				id: t.String(),
			}),
		}
	)
	.patch(
		'/:id',
		async ({ params: { id }, body, status }) => {
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
			body: updateClinicDTO,
		}
	)
	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			const result = await db
				.delete(clinics)
				.where(eq(clinics.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'Clinic not found');
			}

			return { success: true, deletedId: result[0]!.id };

		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
