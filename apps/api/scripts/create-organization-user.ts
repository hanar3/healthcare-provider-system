import { faker } from "@faker-js/faker";
import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "../src/lib/auth";
import { db } from "../src/db";
import * as schema from "../src/db/schema";


export const authClient = createAuthClient({
	baseURL: "http://localhost:3001",
	plugins: [inferAdditionalFields<typeof auth>()]
});
const [username, password] = Bun.argv.slice(2);

if (!username || !password) {
	console.error("Usage: bun run create-user.ts <username> <password>");
	process.exit(1);
}

const organizations = await db.select().from(schema.organizations).limit(10);
const organizationChoice = faker.helpers.arrayElement(organizations.map(c => c.id));

const [profile] = await db.insert(schema.profile).values({
	name: username,
	email: username,
	role: "organization_admin",
}).returning();


if (profile) {
	await db.insert(schema.profileOrganizationAccess).values({
		profileId: profile.id,
		organizationId: organizationChoice
	});

	const user = await authClient.signUp.email({
		name: username,
		email: username,
		password: password,
	})

	console.log(user);
} else {
	console.error("Profile not created");
}

