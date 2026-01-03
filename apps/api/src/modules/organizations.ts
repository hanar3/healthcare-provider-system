import { Elysia, t } from 'elysia';
import { count, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '../db';
import { organizations } from '../db/schema';
import { decrypt, encrypt } from '../lib/crypto';

const createOrgDTO = t.Object({
	name: t.String(),
	status: t.Optional(t.String()),
	plan: t.Optional(t.Integer()),
	govId: t.Optional(t.String())
});

const updateOrgDTO = t.Partial(createOrgDTO);

export const organizationsController = new Elysia({ prefix: '/organizations' })
	.get('/', async ({ query: { page, limit } }) => {
		const data = await db.select().from(organizations).where(isNull(organizations.deletedAt)).offset(page * limit).limit(limit).orderBy(desc(organizations.createdAt));
		const [total] = await db.select({ count: count() }).from(organizations);


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
			page: t.Number(),
			limit: t.Number({ maximum: 100 })
		})
	})

	.get(
		'/:id',
		async ({ params: { id }, status }) => {
			const result = await db
				.select()
				.from(organizations)
				.where(eq(organizations.id, id));

			if (result.length === 0) {
				return status(404, 'Organization not found');
			}

			const org = result.at(0)!; // org is guaranteed to exist due to last check
			if (!org.govId) return org;
			const parts = org.govId.split(":");
			if (parts.length !== 2) {
				console.warn(`org: ${org.id} isn't properly encrypted`); // todo: proper logging
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

	.post(
		'/',
		async ({ body }) => {

			const payload = {
				...body
			};
			if (payload.govId) {
				const encryptedGovId = await encrypt(payload.govId);
				payload.govId = `${encryptedGovId.iv}:${encryptedGovId.data}`;
			}

			const result = await db.insert(organizations).values(payload).returning();
			return result[0];
		},
		{
			body: createOrgDTO,
		}
	)

	.patch(
		'/:id',
		async ({ params: { id }, body, status }) => {
			const result = await db
				.update(organizations)
				.set(body)
				.where(eq(organizations.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'Organization not found');
			}

			return result[0];
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: updateOrgDTO,
		}
	)

	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			try {
				const result = await db
					.update(organizations)
					.set({ deletedAt: new Date() })
					.where(eq(organizations.id, id))
					.returning();

				if (result.length === 0) {
					return status(404, 'Organization not found');
				}

				return { success: true, deletedId: result[0]!.id };
			} catch (err) {
				console.error(err);
				return status(500);
			}

		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
