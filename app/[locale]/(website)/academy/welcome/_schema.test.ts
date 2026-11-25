import { describe, expect, test } from "bun:test";
import { COUNTRY_CODES } from "./_countries";
import { CreateLearnerSchema } from "./_schema";

const valid = {
	certificateName: "Amara Okafor",
	country: "NG",
	campus: "LAUTECH",
	ageConfirmed: true,
};

function issues(input: unknown) {
	const result = CreateLearnerSchema.safeParse(input);
	return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("CreateLearnerSchema", () => {
	test("accepts a complete submission", () => {
		expect(CreateLearnerSchema.safeParse(valid).success).toBe(true);
	});

	test("trims the certificate name", () => {
		const result = CreateLearnerSchema.parse({
			...valid,
			certificateName: "  Amara Okafor  ",
		});
		expect(result.certificateName).toBe("Amara Okafor");
	});

	test("rejects names shorter than three characters", () => {
		expect(issues({ ...valid, certificateName: "A" })).toContain(
			"name_too_short",
		);
		expect(issues({ ...valid, certificateName: " Ab " })).toContain(
			"name_too_short",
		);
		expect(
			CreateLearnerSchema.safeParse({ ...valid, certificateName: "Ada" })
				.success,
		).toBe(true);
	});

	test("rejects empty and whitespace-only names", () => {
		expect(issues({ ...valid, certificateName: "" })).toContain(
			"name_required",
		);
		expect(issues({ ...valid, certificateName: "   " })).toContain(
			"name_required",
		);
	});

	test("enforces the 120 character name limit after trimming", () => {
		expect(
			CreateLearnerSchema.safeParse({
				...valid,
				certificateName: ` ${"a".repeat(120)} `,
			}).success,
		).toBe(true);
		expect(issues({ ...valid, certificateName: "a".repeat(121) })).toContain(
			"name_too_long",
		);
	});

	test("requires an ISO 3166-1 alpha-2 country code", () => {
		expect(issues({ ...valid, country: "" })).toContain("country_required");
		expect(issues({ ...valid, country: "Nigeria" })).toContain(
			"country_required",
		);
		expect(issues({ ...valid, country: "ng" })).toContain("country_required");
		expect(
			CreateLearnerSchema.safeParse({ ...valid, country: "FR" }).success,
		).toBe(true);
	});

	test("campus is optional and trimmed", () => {
		const { campus: _omitted, ...withoutCampus } = valid;
		expect(CreateLearnerSchema.safeParse(withoutCampus).success).toBe(true);
		expect(
			CreateLearnerSchema.safeParse({ ...valid, campus: "" }).success,
		).toBe(true);
		expect(
			CreateLearnerSchema.parse({ ...valid, campus: "  LAUTECH " }).campus,
		).toBe("LAUTECH");
	});

	test("requires the age confirmation", () => {
		expect(issues({ ...valid, ageConfirmed: false })).toContain("age_required");
		expect(
			issues({ ...valid, ageConfirmed: undefined }).length,
		).toBeGreaterThan(0);
	});
});

describe("COUNTRY_CODES", () => {
	test("lists every ISO 3166-1 alpha-2 code once", () => {
		expect(COUNTRY_CODES.length).toBe(249);
		expect(new Set(COUNTRY_CODES).size).toBe(249);
	});
});
