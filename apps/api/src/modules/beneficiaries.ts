import { Elysia, t } from 'elysia';
import {
	and,
	count, eq, ilike, or } from 'drizzle-orm';
import { db } from '../db';
import { organizations, user, userOrganizationAccess } from '../db/schema';
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

const beneficiaryListBaseFilters = [
	or(eq(user.kind, 0), eq(user.kind, 1))
];

const beneficiaryBaseSelect = {
	id: user.id,
	name: user.name,
	email: user.email,
	emailVerified: user.emailVerified,
	image: user.image,
	status: user.status,
	plan: user.plan,
	govId: user.govId,
	organizationId: userOrganizationAccess.organizationId,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
}

export const beneficiariesController = new Elysia({ prefix: '/beneficiaries' })
	.get('/', async ({ query: { page, limit, ...f } }) => {

		
		const baseQuery = db.select({ ...beneficiaryBaseSelect }).from(user).leftJoin(userOrganizationAccess, eq(user.id, userOrganizationAccess.userId));

		const filters = [...beneficiaryListBaseFilters];
		if (f.organizationId) filters.push(eq(userOrganizationAccess.organizationId, f.organizationId));

		if (f.govId) { // govId filter
			const encrypted = await encrypt(f.govId);
			filters.push(eq(user.govId, `${encrypted.iv}:${encrypted.data}`));
		}

		if (f.name) filters.push(ilike(user.name, `%${f.name}%`));
		
 
		const rows = await baseQuery.where(and(...filters)).limit(limit).offset(limit * page);
		const [total] = await db.select({ count: count() }).from(user).leftJoin(userOrganizationAccess, eq(user.id, userOrganizationAccess.userId)).where(and(...filters));
	


		const list = await Promise.all(rows.map(async user => {
			if (!user.govId) return user;

			const parts = user.govId.split(":");
			if (parts.length !== 2) return user;

			const [iv, data] = parts as [string, string];
			const decrypted = await decrypt({ iv, data });
			return {
				...user,
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
			limit: t.Number({ maximum: 100 }),
			organizationId: t.Optional(t.String()),
			govId: t.Optional(t.String()),
			name: t.Optional(t.String())
		})
	})

	.get(
		'/:id',
		async ({ params: { id }, status }) => {
			const result = await db.select({ ...beneficiaryBaseSelect }).from(user).leftJoin(userOrganizationAccess, eq(user.id, userOrganizationAccess.userId)).where(eq(user.id, id));


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

			try {
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
						kind: 0, // beneficiary		TODO: create an enum and to this properly...
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
			} catch (err) {
				console.error(err);
				return err?.message;
			}




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
