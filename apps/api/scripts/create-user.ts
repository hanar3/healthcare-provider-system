
import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "../src/lib/auth";
export const authClient = createAuthClient({
	baseURL: "http://localhost:3001",
	plugins: [inferAdditionalFields<typeof auth>()]
});
const [username, password] = Bun.argv.slice(2);

if (!username || !password) {
	console.error("Usage: bun run create-user.ts <username> <password>");
	process.exit(1);
}


const user = await authClient.signUp.email({
	name: username,
	email: username,
	password: password,
})

console.log(user);

