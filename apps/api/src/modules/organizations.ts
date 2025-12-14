import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { db } from '../db'; // Adjust path to your Drizzle DB instance
import { organizations } from '../db/schema'; // Adjust path to schema

const createOrgDTO = t.Object({
	name: t.String(),
	status: t.Optional(t.String()),
	plan: t.Optional(t.Integer()),
});

const updateOrgDTO = t.Partial(createOrgDTO);

export const organizationsController = new Elysia({ prefix: '/organizations' })
	.get('/', async () => {
		return await db.select().from(organizations);
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
				id: t.Numeric(),
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
				id: t.Numeric(),
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
				id: t.Numeric(),
			}),
		}
	);
