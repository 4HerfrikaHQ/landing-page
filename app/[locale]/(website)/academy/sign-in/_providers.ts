import "server-only";
import { z } from "zod";

const AUTH_SETTINGS_TTL_SECONDS = 300;

const AuthSettings = z.object({
	external: z
		.object({ google: z.boolean().catch(false) })
		.catch({ google: false }),
});

export async function isGoogleSignInEnabled() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return false;
	try {
		const response = await fetch(`${url}/auth/v1/settings`, {
			headers: { apikey: key },
			next: { revalidate: AUTH_SETTINGS_TTL_SECONDS },
		});
		if (!response.ok) return false;
		return AuthSettings.parse(await response.json()).external.google;
	} catch {
		return false;
	}
}
