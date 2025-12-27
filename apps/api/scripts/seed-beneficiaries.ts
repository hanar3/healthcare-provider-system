import { fakerPT_BR as faker } from "@faker-js/faker"
import { db } from "../src/db"
import * as schemas from "../src/db/schema";
import { encrypt } from "../src/lib/crypto";



function generateRG(): string {
	const base = Math.floor(Math.random() * 1e8)
		.toString()
		.padStart(8, "0");

	const digito = Math.random() < 0.1
		? "X"
		: Math.floor(Math.random() * 10).toString();

	return `${base}${digito}`;
}



const orgs = await db.query.organizations.findMany();

const users: typeof schemas.user.$inferInsert[] = [];
const usersOrganizationAccess: typeof schemas.userOrganizationAccess.$inferInsert[] = [];



console.log(`Seeding ${orgs.length} organizations with beneficiaries`);
for (let i = 0; i < orgs.length; i++) {
	for (let j = 0; j < 10; j++) {
		const encryptedRG = await encrypt(generateRG());
		// const email = faker.internet.email();
		const newUserId = Bun.randomUUIDv7();

		users.push({
			id: newUserId,
			name: faker.person.fullName(),
			email: `fake-email-${j}_${i}@a.com`,
			emailVerified: true,
			isSuperAdmin: false,
			govId: `${encryptedRG.iv}:${encryptedRG.data}`,
		});

		if (orgs[i]) {
			usersOrganizationAccess.push({
				userId: newUserId,
				organizationId: orgs[i]!.id,
			})
		}
	}
}


await db.transaction(async (tx) => {
	await tx.insert(schemas.user).values(users).returning();
	await tx.insert(schemas.userOrganizationAccess).values(usersOrganizationAccess).returning();
});


console.log("Done seeding");
process.exit(0);
