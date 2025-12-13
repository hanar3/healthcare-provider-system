import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { defineAbilityFor } from "@workspace/common/auth/ability"


// This is where we will eventually import our routes
const app = new Elysia()
	.use(cors())
	.get('/', () => 'Health Provider API Active')
	.get('/health', () => ({ status: 'ok', timestamp: new Date() }))
	.listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

// EXPORT THE TYPE for the Frontend to use!
export type App = typeof app;
