import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * DEV-ONLY shortcut to sign in as the local admin without email/OTP.
 *
 * It mints a one-time OTP with the service-role key and immediately verifies it
 * on the server-side Supabase client, which writes the session cookies — then
 * redirects to the admin dashboard. Hard-404s in production so it can never be
 * used to bypass auth on a real deployment.
 *
 * Override the target account with ?email=... (defaults to ADMIN_EMAIL / the
 * project's super admin).
 */
export async function GET(request: Request) {
	if (process.env.NODE_ENV === "production") {
		return new NextResponse("Not found", { status: 404 });
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) {
		return NextResponse.json(
			{ error: "Supabase env not configured" },
			{ status: 500 },
		);
	}

	const email =
		new URL(request.url).searchParams.get("email") ??
		process.env.ADMIN_EMAIL ??
		"lope@braindao.org";

	const admin = createAdminClient(url, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	const { data, error } = await admin.auth.admin.generateLink({
		type: "magiclink",
		email,
	});
	const otp = data?.properties?.email_otp;
	if (error || !otp) {
		return NextResponse.json(
			{ error: error?.message ?? "Could not generate OTP" },
			{ status: 500 },
		);
	}

	const cookieStore = await cookies();

	// Clear ALL stale Supabase cookies (auth-token, its chunks like `...token.1`,
	// and leftover PKCE `code-verifier`s) so a corrupted prior session can't
	// poison the new one.
	for (const c of cookieStore.getAll()) {
		if (c.name.startsWith("sb-")) {
			cookieStore.delete(c.name);
		}
	}

	const supabase = createServerClient(url, serviceKey, {
		cookies: {
			getAll: () => cookieStore.getAll(),
			setAll: (cookiesToSet) => {
				for (const { name, value, options } of cookiesToSet) {
					cookieStore.set(name, value, options);
				}
			},
		},
	});

	const { error: verifyError } = await supabase.auth.verifyOtp({
		email,
		token: otp,
		type: "email",
	});
	if (verifyError) {
		return NextResponse.json({ error: verifyError.message }, { status: 500 });
	}

	return NextResponse.redirect(new URL("/dashboard/admin", request.url));
}
