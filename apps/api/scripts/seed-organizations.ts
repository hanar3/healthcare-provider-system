import { fakerPT_BR as faker } from "@faker-js/faker"
import { db } from "../src/db"
import * as schemas from "../src/db/schema";
import { encrypt } from "../src/lib/crypto";


function generateCNPJ() {
	const n = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

	const calc = (base: number[]) => {
		let factor = base.length - 7;
		let sum = base.reduce((acc, num) => acc + num * factor--, 0);
		const mod = sum % 11;
		return mod < 2 ? 0 : 11 - mod;
	};

	n.push(calc(n));
	n.push(calc(n));

	return n.join('');
}

const orgs: Array<typeof schemas.organizations.$inferInsert> = new Array(1200);

console.log(orgs);

for (let i = 0; i < orgs.length; i++) {
	const encryptedCnpj = await encrypt(generateCNPJ());
	// console.log(encryptedCnpj)
	orgs[i] = {
		name: faker.company.name(),
		plan: faker.helpers.arrayElement([0, 1]),
		status: faker.helpers.arrayElement(['active', 'defaulting']),
		govId: `${encryptedCnpj.iv}:${encryptedCnpj.data}`,
	};
}

await db.insert(schemas.organizations).values(orgs).returning();


process.exit(0);
