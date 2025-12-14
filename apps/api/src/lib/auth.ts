import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { createAuthMiddleware } from "better-auth/api";
import { encrypt } from "./crypto";
export const auth = betterAuth({
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/sign-up/email") {
				return;
			}

			if (ctx.body?.govId) {
				const encrypted = await encrypt(ctx.body.govId);
				ctx.body.govId = `${encrypted.iv}:${encrypted.data}`;
			}
		})
	},
	user: {
		additionalFields: {
			govId: { type: "string", required: false },
			status: { type: "string", required: false, defaultValue: "active", input: false },
		}
	},
	emailAndPassword: {
		enabled: true,
		password: {
			hash: pwd => Bun.password.hash(pwd),
			verify: data => Bun.password.verify(data.password, data.hash),
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
