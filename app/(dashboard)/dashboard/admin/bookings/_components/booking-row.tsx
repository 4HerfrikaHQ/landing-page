import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatInTimeZone } from "date-fns-tz";
import type { AdminBookingRow } from "../_actions";
import { NoShowButton } from "./no-show-button";

export function BookingRow({ booking }: { booking: AdminBookingRow }) {
	const canMarkNoShow =
		booking.start_at < new Date() &&
		booking.status !== "no_show" &&
		booking.status !== "cancelled";
	return (
		<tr className="border-t border-border/60 transition-colors hover:bg-muted/40">
			<td className="whitespace-nowrap px-4 py-3 text-foreground">
				{formatInTimeZone(
					booking.start_at,
					booking.mentee_timezone,
					"MMM d, yyyy · HH:mm",
				)}
			</td>
			<td className="px-4 py-3 text-foreground">{booking.mentor_name}</td>
			<td className="px-4 py-3">
				<span className="text-foreground">{booking.mentee_name}</span>{" "}
				<span className="text-xs text-muted-foreground">
					{booking.mentee_email}
				</span>
			</td>
			<td className="px-4 py-3">
				<div className="flex items-center justify-between gap-2">
					<StatusBadge status={booking.status} />
					{canMarkNoShow ? <NoShowButton bookingId={booking.id} /> : null}
				</div>
			</td>
		</tr>
	);
}
