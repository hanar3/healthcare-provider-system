import { pgTable, serial, text, boolean, timestamp, primaryKey, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const organizations = pgTable('organizations', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	status: text('status').default('active'), // 'active', 'defaulting'
	plan: integer('plan').default(0), // 0 -> 'silver', 1 -> 'gold'
	createdAt: timestamp('created_at').defaultNow(),
});

export const clinics = pgTable('clinics', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	address: text('address'),
	createdAt: timestamp('created_at').defaultNow(),
});

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	status: text('status').default('active'), // 'active', 'defaulting'
	plan: integer('plan').default(0), // 0 -> 'silver', 1 -> 'gold'
	govIdHash: text('gov_id_hash'),
	isSuperAdmin: boolean('is_super_admin').default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});



export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const userOrganizationAccess = pgTable('user_organization_access', {
	userId: text('user_id').references(() => user.id).notNull(),
	organizationId: integer('organization_id').references(() => organizations.id).notNull(),
}, (t) => ([{
	pk: primaryKey({ columns: [t.userId, t.organizationId] }),
}]));

export const userClinicAccess = pgTable('user_clinic_access', {
	userId: text('user_id').references(() => user.id).notNull(),
	clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
}, (t) => ([{
	pk: primaryKey({ columns: [t.userId, t.clinicId] }),
}]));

export const usersRelations = relations(user, ({ many }) => ({
	orgAccess: many(userOrganizationAccess),
	clinicAccess: many(userClinicAccess),
}));

export const userOrgRelations = relations(userOrganizationAccess, ({ one }) => ({
	user: one(user, { fields: [userOrganizationAccess.userId], references: [user.id] }),
	organization: one(organizations, { fields: [userOrganizationAccess.organizationId], references: [organizations.id] }),
}));

export const userClinicRelations = relations(userClinicAccess, ({ one }) => ({
	user: one(user, { fields: [userClinicAccess.userId], references: [user.id] }),
	clinic: one(clinics, { fields: [userClinicAccess.clinicId], references: [clinics.id] }),
}));
