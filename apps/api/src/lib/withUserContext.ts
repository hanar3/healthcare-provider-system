import { sql, type ExtractTablesWithRelations } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';

export async function withUserContext<T>(
	userId: string,
	callback: (tx: PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>) => Promise<T>
) {
	return await db.transaction(async (tx) => {
		await tx.execute(
			sql`SELECT set_config('app.current_user_id', ${userId}, true)`
		);

		return callback(tx);
	});
}
