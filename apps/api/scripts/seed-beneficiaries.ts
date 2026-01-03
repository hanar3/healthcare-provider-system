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

const profiles: typeof schemas.profile.$inferInsert[] = [];
const profilesOrganizationAccess: typeof schemas.profileOrganizationAccess.$inferInsert[] = [];



console.log(`Seeding ${orgs.length} organizations with beneficiaries`);
for (let i = 0; i < orgs.length; i++) {
	for (let j = 0; j < 10; j++) {
		const encryptedRG = await encrypt(generateRG());
		// const email = faker.internet.email();
		const newUserId = Bun.randomUUIDv7();

		profiles.push({
			id: newUserId,
			name: faker.person.fullName(),
			email: `fake-email-${i}-${j}@a.com`,
			govId: `${encryptedRG.iv}:${encryptedRG.data}`,
			plan: faker.helpers.arrayElement(['gold', 'silver']),
			status: faker.helpers.arrayElement(['active', 'defaulting', 'grace_period', 'suspended']),
			role: 'beneficiary',

		});

		if (orgs[i]) {
			profilesOrganizationAccess.push({
				profileId: newUserId,
				organizationId: orgs[i]!.id,
			})
		}
	}
}


await db.transaction(async (tx) => {
	await tx.insert(schemas.profile).values(profiles).returning();
	await tx.insert(schemas.profileOrganizationAccess).values(profilesOrganizationAccess).returning();
});


console.log("Done seeding");
process.exit(0);
