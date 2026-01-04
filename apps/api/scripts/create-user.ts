
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

await db.insert(schema.profile).values({
	name: username,
	email: username,
	role: "super_admin",
});
const user = await authClient.signUp.email({
	name: username,
	email: username,
	password: password,
})

console.log(user);


