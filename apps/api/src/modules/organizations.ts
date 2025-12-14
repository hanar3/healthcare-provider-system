import { Elysia, t } from 'elysia';
import { count, eq } from 'drizzle-orm';
import { db } from '../db';
import { organizations } from '../db/schema';

const createOrgDTO = t.Object({
	name: t.String(),
	status: t.Optional(t.String()),
	plan: t.Optional(t.Integer()),
});

const updateOrgDTO = t.Partial(createOrgDTO);

export const organizationsController = new Elysia({ prefix: '/organizations' })
	.get('/', async ({ query: { page, limit } }) => {
		const data = await db.select().from(organizations).offset(page * limit).limit(limit);
		const [total] = await db.select({ count: count() }).from(organizations);

		return {
			list: data,
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

			return result[0];
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
			const result = await db.insert(organizations).values(body).returning();
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
			const result = await db
				.delete(organizations)
				.where(eq(organizations.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'Organization not found');
			}

			return { success: true, deletedId: result[0]!.id };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
