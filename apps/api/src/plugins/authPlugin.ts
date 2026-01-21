import { Elysia } from "elysia";
import { auth } from "../lib/auth";

export const authPlugin = new Elysia({ name: "auth-plugin" })
	.macro({
		isSignedIn: {
			async resolve({ request, status }) {
				const session = await auth.api.getSession({
					headers: request.headers
				});

				if (!session) return status(401, "Unauthorized")
				return {
					user: session?.user,
					session: session?.session
				}
			}
		}
	});
