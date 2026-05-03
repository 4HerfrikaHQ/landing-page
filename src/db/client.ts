import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

type DbInstance = PostgresJsDatabase<typeof schema>;

const globalForDrizzle = global as unknown as { db: DbInstance };

// Next.js hot reload creates new module instances in dev, which would open a new postgres
// connection on every file change and quickly exhaust the connection limit. Caching the
// instance on `global` (which survives hot reloads) ensures we reuse a single connection.
function getDb(): DbInstance {
	if (globalForDrizzle.db) return globalForDrizzle.db;
	const client = postgres(process.env.DATABASE_URL ?? "", { prepare: false });
	globalForDrizzle.db = drizzle(client, { schema });
	return globalForDrizzle.db;
}

export const db = getDb();
