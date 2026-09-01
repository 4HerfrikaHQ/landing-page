"use client";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatInTimeZone } from "date-fns-tz";
import { Eye } from "lucide-react";
import { useState } from "react";
import type { AdminBookingRow } from "../_actions";
import { BookingDetailSheet } from "./booking-detail-sheet";

export function BookingRow({ booking }: { booking: AdminBookingRow }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<TableRow onClick={() => setOpen(true)} className="cursor-pointer">
				<TableCell className="px-4 py-3 text-foreground">
					<p className="whitespace-nowrap font-medium">
						{formatInTimeZone(
							booking.start_at,
							booking.mentee_timezone,
							"MMM d, yyyy · HH:mm",
						)}
					</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{booking.mentee_timezone}
					</p>
				</TableCell>
				<TableCell className="px-4 py-3 text-foreground">
					{booking.mentor_name}
				</TableCell>
				<TableCell className="px-4 py-3">
					<p className="font-medium text-foreground">{booking.mentee_name}</p>
					<p className="max-w-64 truncate text-xs text-muted-foreground">
						{booking.mentee_email}
					</p>
				</TableCell>
				<TableCell className="min-w-52 px-4 py-3">
					<StatusBadge status={booking.status} />
					{booking.status === "cancelled" ? (
						<div className="mt-1.5 max-w-72 text-xs text-muted-foreground">
							{booking.cancelled_at ? (
								<p>
									Cancelled{" "}
									{formatInTimeZone(
										booking.cancelled_at,
										booking.mentee_timezone,
										"MMM d, yyyy",
									)}
								</p>
							) : null}
							<p className="truncate">
								{booking.cancel_reason || "No reason provided"}
							</p>
						</div>
					) : null}
				</TableCell>
				<TableCell className="px-4 py-3 text-right">
					<Button
						variant="ghost"
						size="sm"
						className="gap-1.5"
						onClick={(event) => {
							event.stopPropagation();
							setOpen(true);
						}}
					>
						<Eye className="size-4" />
						View
					</Button>
				</TableCell>
			</TableRow>

			<BookingDetailSheet
				booking={booking}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}
