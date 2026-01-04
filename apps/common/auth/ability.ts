import { AbilityBuilder, createMongoAbility, defineAbility, type MongoAbility } from '@casl/ability';

// Define shapes for TypeScript
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'all' | 'Organization' | 'Clinic' | 'Beneficiary' | 'Doctor' | 'User';
export type UserRole = "benecifiary" | "organization_admin" | "clinic_admin" | "super_admin";
export type AppAbility = MongoAbility<[Actions, Subjects]>;

interface UserPayload {
	id: number;
	role: UserRole;
	orgAccessIds: number[];    // Array of Org IDs user can access
	clinicAccessIds: number[]; // Array of Clinic IDs user can access
}

export function defineAbilityFor(user: UserPayload) {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
	return defineAbility((can) => {
		if (user.role === "super_admin") {
			can('manage', 'all');
		}

		if (user.orgAccessIds.length > 0) {
			can(['read', 'update'], 'Organization', { id: { $in: user.orgAccessIds } });
			can('manage', 'Beneficiary', { organizationId: { $in: user.orgAccessIds } });
		}

		if (user.clinicAccessIds.length > 0) {
			can(['read', 'update'], 'Clinic', { id: { $in: user.clinicAccessIds } });
			can('manage', 'Doctor'); // Simplify: if you manage a clinic, you can manage doctors (we filter lists by clinic ID later)
		}

	});
}


