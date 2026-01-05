import { fakerPT_BR as faker } from "@faker-js/faker"
import { db } from "../src/db"
import * as schemas from "../src/db/schema";
import { encrypt } from "../src/lib/crypto";


const specialties = (await db.select().from(schemas.specialties)).map(s => s.id);

function generateCRM(): string {
	const ufs = [
		'SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'DF', 'GO',
		'MT', 'MS', 'TO', 'PA', 'AM', 'RO', 'RR', 'AP', 'MA', 'PI', 'RN', 'PB',
		'AL', 'SE', 'AC'
	];

	const uf = ufs[Math.floor(Math.random() * ufs.length)];
	const numero = Math.floor(10000 + Math.random() * 90000); // 5 dígitos

	return `${numero}/${uf}`;
}




const clinics = await db.query.clinics.findMany();

const profiles: typeof schemas.profile.$inferInsert[] = [];
const profileClinicAccesses: typeof schemas.profileClinicAccess.$inferInsert[] = [];
const doctorSpecialties: typeof schemas.profileSpecialties.$inferInsert[] = [];



console.log(`Seeding ${clinics.length} clinics with doctors`);
for (const clinic of clinics) {
	for (let j = 0; j < 10; j++) {
		const encrypted = await encrypt(generateCRM());
		const newUserId = Bun.randomUUIDv7();

		profiles.push({
			id: newUserId,
			name: faker.person.fullName(),
			email: `fake-email+${clinic.id}-${j}@a.com`,
			govId: `${encrypted.iv}:${encrypted.data}`,
			status: 'active', 
			role: 'doctor',

		});

		profileClinicAccesses.push({
			profileId: newUserId,
			clinicId: clinic.id,
		});
	}
}

for (const profile of profiles) {
	const dSpecialties = faker.helpers.arrayElements(specialties, { min: 1, max: 3 }); // doctor specialties
	for (const specialty of dSpecialties) {
		doctorSpecialties.push({
			profileId: profile.id!,
			specialtyId: specialty
		})
	}

}

await db.transaction(async (tx) => {
	await tx.insert(schemas.profile).values(profiles).returning();
	await tx.insert(schemas.profileClinicAccess).values(profileClinicAccesses).returning();
	await tx.insert(schemas.profileSpecialties).values(doctorSpecialties).returning();
});


console.log("Done seeding");
process.exit(0);
