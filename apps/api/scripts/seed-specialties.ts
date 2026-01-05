import { fakerPT_BR as faker } from "@faker-js/faker"
import { db } from "../src/db"
import * as schemas from "../src/db/schema";


// as 55 especialidades médicas reconhecidas pelo CFM
const specialties = [
	"Acupuntura",
	"Alergia e imunologia",
	"Anestesiologia",
	"Angiologia",
	"Cardiologia",
	"Cirurgia cardiovascular",
	"Cirurgia da mão",
	"Cirurgia de cabeça e pescoço",
	"Cirurgia do aparelho digestivo",
	"Cirurgia geral",
	"Cirurgia oncológica",
	"Cirurgia pediátrica",
	"Cirurgia plástica",
	"Cirurgia torácica",
	"Cirurgia vascular",
	"Clínica médica",
	"Coloproctologia",
	"Dermatologia",
	"Endocrinologia e metabologia",
	"Endoscopia",
	"Gastroenterologia",
	"Genética médica",
	"Geriatria",
	"Ginecologia e obstetrícia",
	"Hematologia e hemoterapia",
	"Homeopatia",
	"Infectologia",
	"Mastologia",
	"Medicina de emergência",
	"Medicina de família e comunidade",
	"Medicina do trabalho",
	"Medicina do tráfego",
	"Medicina esportiva",
	"Medicina física e reabilitação",
	"Medicina intensiva",
	"Medicina legal e perícia médica",
	"Medicina nuclear",
	"Medicina preventiva e social",
	"Nefrologia",
	"Neurocirurgia",
	"Neurologia",
	"Nutrologia",
	"Oftalmologia",
	"Oncologia clínica",
	"Ortopedia e traumatologia",
	"Otorrinolaringologia",
	"Patologia",
	"Patologia clínica/medicina laboratorial",
	"Pediatria",
	"Pneumologia",
	"Psiquiatria",
	"Radiologia e diagnóstico por imagem",
	"Radioterapia",
	"Reumatologia",
	"Urologia"
];

function slugify(value: string) {
	return value.replace(/\s/g, "-").toLowerCase();
}

const values: typeof schemas.specialties.$inferSelect[] = [];
for (const specialty of specialties) {
	const id = Bun.randomUUIDv7();
	values.push(
		{
			id: id,
			name: specialty,
			slug: slugify(specialty),
		}
	);
}

await db.insert(schemas.specialties).values(values).returning();

console.log(`Inserted ${values.length} specialties`);

process.exit(0);
