import { expect, test } from "bun:test";
import { selectBookingCalendarProvider } from "./booking-calendar-host";

test("booking hosting mode selects the original provider for lifecycle work", () => {
	const providers = { org_google: "org", mentor_google: "mentor" } as const;
	expect(selectBookingCalendarProvider("org_google", providers)).toBe("org");
	expect(selectBookingCalendarProvider("mentor_google", providers)).toBe(
		"mentor",
	);
});
