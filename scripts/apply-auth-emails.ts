import { join } from "node:path";
import config from "../supabase/config.toml";

const API = "https://api.supabase.com/v1/projects";
const ROOT = join(import.meta.dir, "..");

type AuthConfig = Record<string, unknown>;

async function desiredSettings(): Promise<AuthConfig> {
	const { confirmation, magic_link } = config.auth.email.template;
	const read = (path: string) => Bun.file(join(ROOT, path)).text();
	return {
		mailer_subjects_confirmation: confirmation.subject,
		mailer_templates_confirmation_content: await read(
			confirmation.content_path,
		),
		mailer_subjects_magic_link: magic_link.subject,
		mailer_templates_magic_link_content: await read(magic_link.content_path),
		mailer_otp_exp: config.auth.email.otp_expiry,
	};
}

async function request(ref: string, token: string, init?: RequestInit) {
	const response = await fetch(`${API}/${ref}/config/auth`, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		throw new Error(
			`${init?.method ?? "GET"} failed: ${response.status} ${await response.text()}`,
		);
	}
	return (await response.json()) as AuthConfig;
}

function changedKeys(current: AuthConfig, desired: AuthConfig) {
	return Object.keys(desired).filter((key) => current[key] !== desired[key]);
}

async function main() {
	const args = process.argv.slice(2);
	const ref = args[args.indexOf("--project-ref") + 1];
	const apply = args.includes("--apply");
	const token = process.env.SUPABASE_ACCESS_TOKEN;
	if (!args.includes("--project-ref") || !ref || !token) {
		throw new Error(
			"Usage: SUPABASE_ACCESS_TOKEN=... bun auth:emails --project-ref <ref> [--apply]\nCreate the token at https://supabase.com/dashboard/account/tokens.",
		);
	}

	const desired = await desiredSettings();
	const changes = changedKeys(await request(ref, token), desired);
	if (changes.length === 0) {
		console.log(`${ref} already has these sign-in emails. Nothing to do.`);
		return;
	}
	console.log(
		`${ref} differs on:\n${changes.map((key) => `  ${key}`).join("\n")}`,
	);
	if (!apply) {
		console.log("\nDry run. Re-run with --apply to update the project.");
		return;
	}

	await request(ref, token, {
		method: "PATCH",
		body: JSON.stringify(
			Object.fromEntries(changes.map((key) => [key, desired[key]])),
		),
	});
	const remaining = changedKeys(await request(ref, token), desired);
	if (remaining.length > 0) {
		throw new Error(`Updated, but these still differ: ${remaining.join(", ")}`);
	}
	console.log(
		`\nUpdated ${ref}. New sign-in emails now show the 6-digit code.`,
	);
}

await main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
