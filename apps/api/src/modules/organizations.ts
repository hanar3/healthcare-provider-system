import { Elysia, t } from 'elysia';
import { count, desc, eq, ilike, inArray, and } from 'drizzle-orm';
import { db } from '../db';
import { organizations } from '../db/schema';
import { decrypt, encrypt } from '../lib/crypto';
import { authPlugin } from '../plugins/authPlugin';
import { defineAbilityFor } from '@workspace/common/auth/ability';

const createOrgDTO = t.Object({
	name: t.String(),
	status: t.Union([
		t.Literal('active'),
		t.Literal('defaulting'),
		t.Literal('grace_period'),
		t.Literal('suspended'),
	]),
	plan: t.Union([
		t.Literal('silver'),
		t.Literal('gold')
	]),
	govId: t.Optional(t.String())
});

const updateOrgDTO = t.Partial(createOrgDTO);

export const organizationsController = new Elysia({ prefix: '/organizations' })
	.use(authPlugin)
	.get('/', async ({ query: { page, limit, status: qStatus, name }, profile, status }) => {
		const rules = defineAbilityFor(profile);
		if (rules.cannot('read', 'Organization')) return status(401, "Unauthorized");
		const filters = [];

		if (name) {
			filters.push(ilike(organizations.name, `%${name}%`));
		}

		if (qStatus) {
			filters.push(eq(organizations.status, qStatus));
		}

		if (profile.orgAccessIds.length > 0) {
			filters.push(inArray(organizations.id, profile.orgAccessIds))
		}

		const data = await db.select().from(organizations).offset(page * limit).where(and(...filters)).limit(limit).orderBy(desc(organizations.createdAt));
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
		isSignedIn: true,
		query: t.Object({
			name: t.Optional(t.String()),
			cnpj: t.Optional(t.String()),
			status: t.Optional(t.Union([
				t.Literal('active'),
				t.Literal('defaulting'),
				t.Literal('grace_period'),
				t.Literal('suspended'),
			])),
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
					.delete(organizations)
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
