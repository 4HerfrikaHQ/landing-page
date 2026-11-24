import { type SetAllCookies, createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { isAcademyPath } from "./app/[locale]/(website)/academy/sign-in/_helpers";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function createSessionClient(request: NextRequest, onCookies: SetAllCookies) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Supabase environment variables are not configured");
	}

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => request.cookies.getAll(),
			setAll: onCookies,
		},
	});
}

async function refreshDashboardSession(request: NextRequest) {
	let response = NextResponse.next({ request });
	const supabase = createSessionClient(request, (cookiesToSet, headers) => {
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
	});

	await supabase.auth.getClaims();
	return response;
}

async function routeWithFreshSession(request: NextRequest) {
	const refreshed: Parameters<SetAllCookies>[0] = [];
	const refreshHeaders: Record<string, string> = {};
	const supabase = createSessionClient(request, (cookiesToSet, headers) => {
		for (const { name, value } of cookiesToSet) {
			request.cookies.set(name, value);
		}
		refreshed.push(...cookiesToSet);
		Object.assign(refreshHeaders, headers);
	});

	await supabase.auth.getClaims();
	const response = handleI18nRouting(request);
	for (const { name, value, options } of refreshed) {
		response.cookies.set(name, value, options);
	}
	for (const [name, value] of Object.entries(refreshHeaders)) {
		response.headers.set(name, value);
	}
	return response;
}

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname.startsWith("/dashboard")) {
		return refreshDashboardSession(request);
	}

	if (isAcademyPath(pathname)) {
		return routeWithFreshSession(request);
	}
	return handleI18nRouting(request);
}

export const config = {
	matcher: [
		"/((?!api|auth/callback|_next|_vercel|assets|favicon|reports|.*(?:opengraph-image|twitter-image).*|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|woff|woff2|ttf|txt|xml|json|pdf)$).*)",
	],
};
