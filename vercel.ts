import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
	framework: "nextjs",
	buildCommand: `if [ "$VERCEL_ENV" = "production" ]; then bun run db:migrate && next build; else next build; fi`,
};
