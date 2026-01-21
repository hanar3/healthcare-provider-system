import { Elysia } from "elysia";
import { auth } from "../lib/auth";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { profile } from "../db/schema";

export const authPlugin = new Elysia({ name: "auth-plugin" })
	.macro({
		isSignedIn: {
			async resolve({ request, status }) {
				const session = await auth.api.getSession({
					headers: request.headers
				});

				if (!session) return status(401, "Unauthorized")

				const profileData = await db.query.profile.findFirst({
					where: eq(profile.userId, session.user.id),
					with: {
						clinicAccess: {
							columns: {
								clinicId: true
							}
						},
						orgAccess: {
							columns: {
								organizationId: true,
							}
						}
					}
				});

				if (!profileData) return status(404, "No profile found, can't determine authorization level without a profile");

				const me = {
					id: profileData.id,
					role: profileData.role,
					name: profileData.name,
					email: profileData.email,
					orgAccessIds: profileData.orgAccess.map(access => access.organizationId),
					clinicAccessIds: profileData.clinicAccess.map(access => access.clinicId),
				};

				return {
					user: session?.user,
					session: session?.session,
					profile: me,
				}
			}
		}
	});
