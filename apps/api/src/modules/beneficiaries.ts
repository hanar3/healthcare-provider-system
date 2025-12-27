import { Elysia, t } from 'elysia';
import { count, eq } from 'drizzle-orm';
import { db } from '../db';
import { organizations, user, userClinicAccess, userOrganizationAccess } from '../db/schema';
import { decrypt, encrypt } from '../lib/crypto';

const createBeneficiaryDTO = t.Object({
	name: t.String(),
	email: t.String(),
	image: t.Optional(t.String()),
	plan: t.Optional(t.Integer()),
	govId: t.Optional(t.String()),
	organizationId: t.Optional(t.String())
});

const updateBeneficiaryDTO = t.Partial(createBeneficiaryDTO);

export const beneficiariesController = new Elysia({ prefix: '/beneficiaries' })
	.get('/', async ({ query: { page, limit } }) => {
		const data = await db.query.user.findMany({
			with: {
				orgAccess: {
					columns: {
						organizationId: true
					}
				}
			}
		});
		const [total] = await db.select({ count: count() }).from(user);


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
				.from(user)
				.where(eq(user.id, id));

			if (result.length === 0) {
				return status(404, 'Organization not found');
			}

			const org = result.at(0)!; // org is guaranteed to exist due to last check
			if (!org.govId) return org;
			const parts = org.govId.split(":");
			if (parts.length !== 2) {
				console.warn(`user: ${org.id} isn't properly encrypted`); // todo: proper logging
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

			const result = await db.transaction(async () => {
				const newUserId = Bun.randomUUIDv7();

				const userResult = await db.insert(user).values({
					id: newUserId,
					email: body.email,
					name: body.name,
					emailVerified: true,
					isSuperAdmin: false,
					image: undefined,
					govId: payload.govId,
				}).returning();

				if (body.organizationId) {
					await db.insert(userOrganizationAccess).values({
						userId: newUserId,
						organizationId: body.organizationId,
					})
				}

				return userResult;
			});



			return result[0];
		},
		{
			body: createBeneficiaryDTO,
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
				.update(user)
				.set(body)
				.where(eq(user.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'User not found');
			}

			return result[0];
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: updateBeneficiaryDTO,
		}
	)

	.delete(
		'/:id',
		async ({ params: { id }, status }) => {
			const result = await db
				.delete(user)
				.where(eq(user.id, id))
				.returning();

			if (result.length === 0) {
				return status(404, 'User not found');
			}

			return { success: true, deletedId: result[0]!.id };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		}
	);
