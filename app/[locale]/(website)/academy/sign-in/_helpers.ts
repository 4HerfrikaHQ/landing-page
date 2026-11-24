import { routing } from "@/i18n/routing";
import { type Locale, hasLocale } from "next-intl";

export const ACADEMY_HOME_PATH = "/academy";
export const SIGN_IN_PATH = "/academy/sign-in";
export const WELCOME_PATH = "/academy/welcome";
export const AUTH_CALLBACK_PATH = "/auth/callback";

const PROBE_ORIGIN = "https://same-origin.invalid";
const FORBIDDEN_PATH_CHARACTERS = /[\\\s]/;
const SECONDS_PER_MINUTE = 60;

const academyPathPattern = new RegExp(
	`^(?:/(?:${routing.locales.join("|")}))?${ACADEMY_HOME_PATH}(?:/|$)`,
);

export function isSafeNextPath(value: unknown): value is string {
	if (typeof value !== "string") return false;
	if (!value.startsWith("/") || value.startsWith("//")) return false;
	if (FORBIDDEN_PATH_CHARACTERS.test(value)) return false;
	try {
		return new URL(value, PROBE_ORIGIN).origin === PROBE_ORIGIN;
	} catch {
		return false;
	}
}

export function resolveNext(value: unknown, fallback: string): string {
	return isSafeNextPath(value) ? value : fallback;
}

export function isAcademyPath(pathname: string): boolean {
	return academyPathPattern.test(pathname);
}

export function localeFromPath(path: string): Locale {
	const segment = path.split("/")[1];
	return hasLocale(routing.locales, segment) ? segment : routing.defaultLocale;
}

export function localizedPath(locale: Locale, path: string): string {
	return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

export function pathWithNext(basePath: string, next: string): string {
	return `${basePath}?next=${encodeURIComponent(next)}`;
}

export function signInPath(locale: Locale, next: string): string {
	return pathWithNext(localizedPath(locale, SIGN_IN_PATH), next);
}

export function welcomePath(locale: Locale, next: string): string {
	return pathWithNext(localizedPath(locale, WELCOME_PATH), next);
}

export function callbackUrl(origin: string, next: string): string {
	return `${origin}${pathWithNext(AUTH_CALLBACK_PATH, next)}`;
}

export function formatCountdown(totalSeconds: number): string {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
	return `${minutes}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;
}
