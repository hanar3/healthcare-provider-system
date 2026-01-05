import { pgTable, text, boolean, timestamp, primaryKey, integer, index, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const profileRole = pgEnum('profile_role_enum', [
	'beneficiary',
	'organization_admin',
	'clinic_admin',
	'super_admin',
	'doctor'
]);

export const plan = pgEnum('plan_enum', [
	'silver',
	'gold'
]);

export const paymentStatus = pgEnum('payment_status_enum', [
	'active',
	'defaulting',
	'suspended',
	'grace_period'
]);

export const organizations = pgTable('organizations', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	status: paymentStatus('status').default('active'), 
	plan: plan('plan').default('silver'), 
	govId: text('gov_id'), 
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const clinics = pgTable('clinics', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	address: text('address'),
	govId: text('gov_id'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const profile = pgTable("profile", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	status: paymentStatus('status').default('active'), 
	govId: text('gov_id'),
	plan: plan('plan').default('silver'), 
	role: profileRole('role'),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
})

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
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
			.$onUpdate(() => new Date())
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
			.$onUpdate(() => new Date())
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


export const profileOrganizationAccess = pgTable('profile_organization_access', {
	profileId: uuid('profile_id').references(() => profile.id, { onDelete: 'cascade' }).notNull(),
	organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
}, (t) => ([{
	pk: primaryKey({ columns: [t.profileId, t.organizationId] }),
}]));

export const profileClinicAccess = pgTable('profile_clinic_access', {
	profileId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
	clinicId: uuid('clinic_id').references(() => clinics.id).notNull(),
}, (t) => ([{
	pk: primaryKey({ columns: [t.profileId, t.clinicId] }),
}]));

export const profileRelations = relations(profile, ({ many, one }) => ({
	orgAccess: many(profileOrganizationAccess),
	clinicAccess: many(profileClinicAccess),
	user: one(user, {
		fields: [profile.userId],
		references: [user.id],
	}),
}));

export const profileOrgRelations = relations(profileOrganizationAccess, ({ one }) => ({
	profile: one(profile, { fields: [profileOrganizationAccess.profileId], references: [profile.id] }),
	organization: one(organizations, { fields: [profileOrganizationAccess.organizationId], references: [organizations.id] }),
}));

export const profileClinicRelations = relations(profileClinicAccess, ({ one }) => ({
	profile: one(profile, { fields: [profileClinicAccess.profileId], references: [profile.id] }),
	clinic: one(clinics, { fields: [profileClinicAccess.clinicId], references: [clinics.id] }),
}));
