import { describe, expect, test } from "bun:test";
import { MinLeadHoursSchema, canReschedule } from "./booking-rules";

const HOUR = 60 * 60 * 1000;

describe("canReschedule", () => {
	test("true when more than 24h ahead", () => {
		expect(canReschedule(25 * HOUR, 0)).toBe(true);
	});
	test("false at exactly 24h", () => {
		expect(canReschedule(24 * HOUR, 0)).toBe(false);
	});
	test("false when inside 24h", () => {
		expect(canReschedule(23 * HOUR, 0)).toBe(false);
	});
	test("false when in the past", () => {
		expect(canReschedule(-1 * HOUR, 0)).toBe(false);
	});
});

describe("MinLeadHoursSchema", () => {
	test("accepts 0, 24, 168", () => {
		expect(MinLeadHoursSchema.parse(0)).toBe(0);
		expect(MinLeadHoursSchema.parse(24)).toBe(24);
		expect(MinLeadHoursSchema.parse(168)).toBe(168);
	});
	test("rejects negative, >168, and non-integers", () => {
		expect(MinLeadHoursSchema.safeParse(-1).success).toBe(false);
		expect(MinLeadHoursSchema.safeParse(169).success).toBe(false);
		expect(MinLeadHoursSchema.safeParse(2.5).success).toBe(false);
	});
});
