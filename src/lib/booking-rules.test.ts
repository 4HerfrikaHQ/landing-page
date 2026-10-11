import { describe, expect, test } from "bun:test";
import {
	MinLeadHoursSchema,
	attendanceStatus,
	canReschedule,
	isAttendanceDisputed,
} from "./booking-rules";

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

describe("attendanceStatus", () => {
	test("stays confirmed until someone answers", () => {
		expect(attendanceStatus({ mentor: null, mentee: null })).toBe("confirmed");
		expect(
			attendanceStatus({ mentor: null, mentee: "rescheduled_externally" }),
		).toBe("confirmed");
	});

	test("a yes from either side completes the booking", () => {
		expect(attendanceStatus({ mentor: "attended", mentee: null })).toBe(
			"completed",
		);
		expect(attendanceStatus({ mentor: null, mentee: "yes" })).toBe("completed");
	});

	test("a no-show from either side wins over a yes", () => {
		expect(
			attendanceStatus({ mentor: "attended", mentee: "mentor_no_show" }),
		).toBe("no_show");
		expect(attendanceStatus({ mentor: "no_show", mentee: "yes" })).toBe(
			"no_show",
		);
	});
});

describe("isAttendanceDisputed", () => {
	test("needs both answers", () => {
		expect(isAttendanceDisputed({ mentor: "attended", mentee: null })).toBe(
			false,
		);
		expect(isAttendanceDisputed({ mentor: null, mentee: "yes" })).toBe(false);
	});

	test("matching answers are not disputed", () => {
		expect(isAttendanceDisputed({ mentor: "attended", mentee: "yes" })).toBe(
			false,
		);
		expect(
			isAttendanceDisputed({ mentor: "no_show", mentee: "mentee_no_show" }),
		).toBe(false);
	});

	test("contradicting answers are disputed", () => {
		expect(
			isAttendanceDisputed({ mentor: "attended", mentee: "mentor_no_show" }),
		).toBe(true);
		expect(isAttendanceDisputed({ mentor: "no_show", mentee: "yes" })).toBe(
			true,
		);
		expect(
			isAttendanceDisputed({ mentor: "no_show", mentee: "mentor_no_show" }),
		).toBe(true);
	});

	test("a call held elsewhere is not a dispute", () => {
		expect(
			isAttendanceDisputed({
				mentor: "attended",
				mentee: "rescheduled_externally",
			}),
		).toBe(false);
	});
});
