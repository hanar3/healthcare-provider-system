import { AbilityBuilder, createMongoAbility, defineAbility, type MongoAbility } from '@casl/ability';

// Define shapes for TypeScript
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'all' | 'Organization' | 'Clinic' | 'Beneficiary' | 'Doctor' | 'User';
export type UserRole = "beneficiary" | "organization_admin" | "clinic_admin" | "super_admin" | "doctor";
export type AppAbility = MongoAbility<[Actions, Subjects]>;

interface UserPayload {
	id: string;
	name: string;
	email: string;
	role: UserRole | null;
	orgAccessIds: string[];    // Array of Org IDs user can access
	clinicAccessIds: string[]; // Array of Clinic IDs user can access
}

export function defineAbilityFor(user?: UserPayload | null) {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
	return defineAbility((can) => {
		if (!user) return cannot("manage", "all");

		if (user.role === "super_admin") {
			can('manage', 'all');
		}

		if (user.orgAccessIds.length > 0) {
			can(['read', 'update'], 'Organization', { id: { $in: user.orgAccessIds } });
			can('manage', 'Beneficiary', { organizationId: { $in: user.orgAccessIds } });
			cannot(['delete'], 'Organization');
		}

		if (user.clinicAccessIds.length > 0) {
			can(['read', 'update'], 'Clinic', { id: { $in: user.clinicAccessIds } });
			can('manage', 'Doctor');
			cannot(['delete', 'create'], 'Clinic');
		}

	});
}

