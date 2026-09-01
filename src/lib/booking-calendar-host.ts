import type { BookingHostingMode } from "@/src/db/schema/tables/bookings";

export function selectBookingCalendarProvider<T>(
	hostingMode: BookingHostingMode,
	providers: { org_google: T; mentor_google: T },
): T {
	return providers[hostingMode];
}
