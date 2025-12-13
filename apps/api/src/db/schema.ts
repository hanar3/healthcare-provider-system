import { pgTable, serial, text, boolean, timestamp, primaryKey, integer } from 'drizzle-orm/pg-core';
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

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: text('email').unique().notNull(),
	passwordHash: text('password_hash').notNull(),
	fullName: text('full_name'),
	status: text('status').default('active'), // 'active', 'defaulting'
	plan: integer('plan').default(0), // 0 -> 'silver', 1 -> 'gold'
	isSuperAdmin: boolean('is_super_admin').default(false),
	createdAt: timestamp('created_at').defaultNow(),
});

export const userOrganizationAccess = pgTable('user_organization_access', {
	userId: integer('user_id').references(() => users.id).notNull(),
	organizationId: integer('organization_id').references(() => organizations.id).notNull(),
}, (t) => ({
	pk: primaryKey({ columns: [t.userId, t.organizationId] }),
}));

export const userClinicAccess = pgTable('user_clinic_access', {
	userId: integer('user_id').references(() => users.id).notNull(),
	clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
}, (t) => ({
	pk: primaryKey({ columns: [t.userId, t.clinicId] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	orgAccess: many(userOrganizationAccess),
	clinicAccess: many(userClinicAccess),
}));

export const userOrgRelations = relations(userOrganizationAccess, ({ one }) => ({
	user: one(users, { fields: [userOrganizationAccess.userId], references: [users.id] }),
	organization: one(organizations, { fields: [userOrganizationAccess.organizationId], references: [organizations.id] }),
}));

export const userClinicRelations = relations(userClinicAccess, ({ one }) => ({
	user: one(users, { fields: [userClinicAccess.userId], references: [users.id] }),
	clinic: one(clinics, { fields: [userClinicAccess.clinicId], references: [clinics.id] }),
}));
