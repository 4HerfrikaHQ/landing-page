import { describe, expect, test } from "bun:test";
import { computeSlots, slotCheckWindow } from "./_helpers";

const settings = {
	session_duration_minutes: 30,
	min_lead_hours: 24,
	max_horizon_days: 30,
	buffer_minutes: 15,
	max_active_bookings_per_mentee: 3,
};
const now = new Date("2026-10-09T12:00:00Z");

describe("slotCheckWindow", () => {
	for (const timezone of [
		"Africa/Lagos",
		"Africa/Nairobi",
		"America/New_York",
		"America/Los_Angeles",
		"Pacific/Auckland",
	]) {
		test(`accepts every listed slot for a mentor in ${timezone}`, () => {
			const availabilityTemplates = [
				{
					day: "Wednesday" as const,
					start_time: "00:00:00",
					end_time: "23:30:00",
					timezone,
				},
			];
			const listed = computeSlots({
				availabilityTemplates,
				existingBookings: [],
				settings,
				fromUtc: new Date("2026-10-12T00:00:00Z"),
				toUtc: new Date("2026-10-19T00:00:00Z"),
				now,
			});
			expect(listed.length).toBeGreaterThan(0);

			const rejected = listed.filter((slot) => {
				const start = new Date(slot.startUtc);
				return !computeSlots({
					availabilityTemplates,
					existingBookings: [],
					settings,
					...slotCheckWindow(start),
					now,
				}).some((s) => s.startUtc === slot.startUtc);
			});
			expect(rejected).toEqual([]);
		});
	}
});
