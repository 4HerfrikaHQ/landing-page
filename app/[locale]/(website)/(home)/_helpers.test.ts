import { describe, expect, test } from "bun:test";
import { firstName, mentorCreditName } from "./_helpers";

describe("firstName", () => {
	test("keeps only the first word", () => {
		expect(firstName("Mary Jane Okafor")).toBe("Mary");
	});

	test("ignores surrounding whitespace", () => {
		expect(firstName("  Mary  ")).toBe("Mary");
	});
});

describe("mentorCreditName", () => {
	test("shows the nickname with the full name in parentheses", () => {
		expect(
			mentorCreditName({ name: "Sharon Ariyo-Adeoye", nickname: "Ronnie" }),
		).toBe("Ronnie (Sharon Ariyo-Adeoye)");
	});

	test("falls back to the full name", () => {
		expect(mentorCreditName({ name: "Sharon", nickname: " " })).toBe("Sharon");
		expect(mentorCreditName({ name: "Sharon", nickname: null })).toBe("Sharon");
	});
});
