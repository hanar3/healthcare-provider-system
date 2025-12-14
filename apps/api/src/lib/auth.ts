import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
		password: {
			hash: pwd => Bun.password.hash(pwd, "bcrypt"),
			verify: data => Bun.password.verify(data.password, data.hash, "bcrypt"),
		}
	},
	trustedOrigins: [
		"http://localhost:3000"
	],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
});
