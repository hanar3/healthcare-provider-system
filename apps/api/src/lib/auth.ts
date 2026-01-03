import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";
export const auth = betterAuth({
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/sign-up/email") {
				return;
			}
			const body = ctx.body;

			const user = ctx.context.newSession?.user;
			if (user) {
				const [profile] = await db.select().from(schema.profile).where(eq(schema.profile.email, user.email));
				if (profile) {
					console.log(`user: ${user.email} already has a profile, associating new user with it`);
					await db.update(schema.profile).set({
						userId: user.id,
					}).where(eq(schema.profile.email, body.email));
				} else {
					// create a profile if it doesn't exist
					// this has some implications, the new profile will be created without a proper role
					console.warn('user: ' + user.email + ' had no profile, creating one without a role.');
					await db.insert(schema.profile).values({
						name: user.name,
						email: user.email,
						userId: user.id,
					})
				}
			}

		})
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
