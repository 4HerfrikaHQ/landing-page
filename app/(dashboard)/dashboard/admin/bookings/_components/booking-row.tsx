import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatInTimeZone } from "date-fns-tz";
import type { AdminBookingRow } from "../_actions";

export function BookingRow({ booking }: { booking: AdminBookingRow }) {
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
				<StatusBadge status={booking.status} />
			</td>
		</tr>
	);
}
