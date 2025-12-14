import { Elysia, type Context } from 'elysia';
import { swagger } from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { defineAbilityFor } from "@workspace/common/auth/ability"
import { auth } from "./lib/auth";
import { organizationsController } from './modules/organizations';

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
	.use(organizationsController)
	.get('/', () => 'Health Provider API Active')
	.get('/health', () => ({ status: 'ok', timestamp: new Date() }))
	.all("/api/auth/*", betterAuthView)
	.listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
