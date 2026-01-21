import { Elysia, type Context } from 'elysia';
import { swagger } from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { auth } from "./lib/auth";
import { organizationsController } from './modules/organizations';
import { beneficiariesController } from './modules/beneficiaries';
import { clinicsController } from './modules/clinics';
import { doctorsController } from './modules/doctors';
import { specialtiesController } from './modules/specialties';
import { profileController } from './modules/profile';


const betterAuthView = (context: Context) => {
	const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]
	if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
		return auth.handler(context.request);
	} else {
		context.status(405);
	}
}


const app = new Elysia()
	.use(cors())
	.use(swagger())
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
	})
	.use(organizationsController)
	.use(beneficiariesController)
	.use(clinicsController)
	.use(doctorsController)
	.use(specialtiesController)
	.use(profileController)
	.get('/', () => 'Health Provider API Active')
	.get('/health', () => ({ status: 'ok', timestamp: new Date() }))
	.all("/api/auth/*", betterAuthView)
	.listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
