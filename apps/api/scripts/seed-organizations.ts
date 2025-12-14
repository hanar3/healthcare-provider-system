import { faker } from "@faker-js/faker"
import { db } from "../src/db"
import * as schemas from "../src/db/schema";

const orgs: Array<typeof schemas.organizations.$inferInsert> = new Array(1200).fill(undefined).map(() => ({
	name: faker.company.name(),
	plan: faker.helpers.arrayElement([0, 1]),
	status: faker.helpers.arrayElement(['active', 'defaulting'])
}))

await db.insert(schemas.organizations).values(orgs).returning();


process.exit(0);
