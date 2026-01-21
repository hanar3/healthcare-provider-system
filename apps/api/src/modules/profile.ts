import { Elysia, t } from 'elysia';
import { eq } from "drizzle-orm";
import { db } from "../db"
import { profile, profileClinicAccess, profileOrganizationAccess, profileOrgRelations } from "../db/schema";
import { authPlugin } from '../plugins/authPlugin';

export const profileController = new Elysia({ prefix: '/profile' })
	.use(authPlugin)
	.get('/me', async ({ user, status }) => {
		const profileData = await db.query.profile.findFirst({
			where: eq(profile.userId, user.id),
			with: {
				orgAccess: {
					columns: {
						organizationId: true
					}
				},
				clinicAccess: {
					columns: {
						clinicId: true
					}
				}
			}


		});

		if (!profileData) return status(404, "Not found");

		const me = {
			id: profileData.id,
			role: profileData.role,
			name: profileData.name,
			email: profileData.email,
			orgAccessIds: profileData.orgAccess.map(access => access.organizationId),
			clinicAccessIds: profileData.clinicAccess.map(access => access.clinicId),
		};

		return me;
	}, {
		isSignedIn: true
	})



