import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

async function refreshDashboardSession(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Supabase environment variables are not configured");
	}

	let response = NextResponse.next({ request });
	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll: (cookiesToSet, headers) => {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}

				response = NextResponse.next({ request });
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options);
				}
				for (const [name, value] of Object.entries(headers)) {
					response.headers.set(name, value);
				}
			},
		},
	});

	await supabase.auth.getClaims();
	return response;
}

export default function proxy(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/dashboard")) {
		return refreshDashboardSession(request);
	}

	return handleI18nRouting(request);
}

export const config = {
	matcher: [
		"/((?!api|_next|_vercel|assets|favicon|reports|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|woff|woff2|ttf|txt|xml|json|pdf)$).*)",
	],
};
