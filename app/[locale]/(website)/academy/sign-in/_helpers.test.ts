import { describe, expect, test } from "bun:test";
import {
	callbackUrl,
	formatCountdown,
	isAcademyPath,
	isSafeNextPath,
	localeFromPath,
	localizedPath,
	resolveNext,
	signInPath,
	welcomePath,
} from "./_helpers";

describe("isSafeNextPath", () => {
	test("accepts same-origin relative paths", () => {
		expect(isSafeNextPath("/academy/x")).toBe(true);
		expect(isSafeNextPath("/fr/academy/courses?lesson=2#top")).toBe(true);
		expect(isSafeNextPath("/academy/welcome?next=%2Facademy")).toBe(true);
	});

	test("rejects protocol-relative and absolute URLs", () => {
		expect(isSafeNextPath("//evil.com")).toBe(false);
		expect(isSafeNextPath("https://evil.com")).toBe(false);
		expect(isSafeNextPath("javascript:alert(1)")).toBe(false);
	});

	test("rejects backslash and whitespace tricks", () => {
		expect(isSafeNextPath("/\\evil")).toBe(false);
		expect(isSafeNextPath("/\tevil.com")).toBe(false);
		expect(isSafeNextPath("/ academy")).toBe(false);
	});

	test("rejects empty and non-string values", () => {
		expect(isSafeNextPath("")).toBe(false);
		expect(isSafeNextPath(undefined)).toBe(false);
		expect(isSafeNextPath(null)).toBe(false);
		expect(isSafeNextPath(["/academy"])).toBe(false);
	});
});

describe("resolveNext", () => {
	test("falls back when unsafe", () => {
		expect(resolveNext("//evil.com", "/academy")).toBe("/academy");
		expect(resolveNext("", "/academy")).toBe("/academy");
	});

	test("keeps safe paths", () => {
		expect(resolveNext("/academy/x", "/academy")).toBe("/academy/x");
	});
});

describe("locale paths", () => {
	test("localizedPath prefixes only non-default locales", () => {
		expect(localizedPath("en", "/academy")).toBe("/academy");
		expect(localizedPath("fr", "/academy")).toBe("/fr/academy");
	});

	test("localeFromPath reads the first segment", () => {
		expect(localeFromPath("/sw/academy/x")).toBe("sw");
		expect(localeFromPath("/academy/x")).toBe("en");
		expect(localeFromPath("/")).toBe("en");
	});

	test("signInPath and welcomePath carry an encoded next", () => {
		expect(signInPath("fr", "/fr/academy/welcome")).toBe(
			"/fr/academy/sign-in?next=%2Ffr%2Facademy%2Fwelcome",
		);
		expect(welcomePath("en", "/academy/x")).toBe(
			"/academy/welcome?next=%2Facademy%2Fx",
		);
	});

	test("callbackUrl points at the auth callback", () => {
		expect(callbackUrl("https://4herfrika.org", "/academy")).toBe(
			"https://4herfrika.org/auth/callback?next=%2Facademy",
		);
	});
});

describe("isAcademyPath", () => {
	test("matches academy routes in every locale", () => {
		expect(isAcademyPath("/academy")).toBe(true);
		expect(isAcademyPath("/academy/sign-in")).toBe(true);
		expect(isAcademyPath("/fr/academy")).toBe(true);
		expect(isAcademyPath("/sw/academy/welcome")).toBe(true);
	});

	test("ignores other routes", () => {
		expect(isAcademyPath("/")).toBe(false);
		expect(isAcademyPath("/academyfoo")).toBe(false);
		expect(isAcademyPath("/blog/academy")).toBe(false);
		expect(isAcademyPath("/dashboard/mentor")).toBe(false);
	});
});

describe("formatCountdown", () => {
	test("formats m:ss", () => {
		expect(formatCountdown(42)).toBe("0:42");
		expect(formatCountdown(60)).toBe("1:00");
		expect(formatCountdown(5)).toBe("0:05");
		expect(formatCountdown(-3)).toBe("0:00");
	});
});
