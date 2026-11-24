import { describe, expect, test } from "bun:test";
import { AFRICAN_COUNTRY_CODES } from "./_countries";
import { countryOptions, flagEmoji } from "./_helpers";

describe("flagEmoji", () => {
	test("maps a code to its regional indicator flag", () => {
		expect(flagEmoji("NG")).toBe("\u{1F1F3}\u{1F1EC}");
	});
});

describe("countryOptions", () => {
	test("lists African countries first and never repeats a code", () => {
		const { africa, other } = countryOptions("en");
		expect(africa.length).toBe(AFRICAN_COUNTRY_CODES.length);
		expect(africa.map((c) => c.code)).toContain("NG");
		expect(other.map((c) => c.code)).not.toContain("NG");
		expect(other.map((c) => c.code)).toContain("US");
		const all = [...africa, ...other].map((c) => c.code);
		expect(new Set(all).size).toBe(all.length);
	});

	test("sorts by localized name", () => {
		const { africa } = countryOptions("en");
		expect(africa[0].code).toBe("DZ");
	});
});
