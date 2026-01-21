import { Elysia } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { profile } from "../db/schema";

export const emailExists = new Elysia({ name: "auth-plugin" })
	.macro({
		conflictIfEmailExists: {
			async resolve({ body, status }) {
				const b = body as { email?: string };
				if (b?.email) {
					const [p] = await db.select().from(profile).where(eq(profile.email, b.email))
					if (p) return status(409, "Conflict")
				}
			}
		}
	});
