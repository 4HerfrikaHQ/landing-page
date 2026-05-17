import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./src/db/migrations",
	dialect: "postgresql",
	schema: "./src/db/schema/tables/*.ts",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
