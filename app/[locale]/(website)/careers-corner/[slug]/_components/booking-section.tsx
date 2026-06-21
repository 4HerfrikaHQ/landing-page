"use client";

import { SlotPicker } from "@/components/booking/slot-picker";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { formatInTimeZone } from "date-fns-tz";
import { useState } from "react";
import { BookingForm } from "./booking-form";

export function BookingSection({
	mentorSlug,
	mentorName,
	initialWeekStart,
}: {
	mentorSlug: string;
	mentorName: string;
	initialWeekStart: string | null;
}) {
	const [selected, setSelected] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const tz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";

	const whenLabel = selected
		? formatInTimeZone(new Date(selected), tz, "EEEE, MMM d 'at' HH:mm zzz")
		: undefined;

	return (
		<>
			<SlotPicker
				mentorSlug={mentorSlug}
				initialWeekStart={initialWeekStart}
				selectedStartUtc={selected}
				onSelect={(s) => {
					setSelected(s);
					setOpen(true);
				}}
			/>
			<Sheet
				open={open}
				onOpenChange={(o) => {
					setOpen(o);
					if (!o) setSelected(null);
				}}
			>
				<SheetContent className="flex flex-col overflow-y-auto px-4 sm:max-w-2xl! sm:px-6">
					<SheetHeader className="px-0">
						<SheetTitle>Book with {mentorName}</SheetTitle>
					</SheetHeader>
					{selected && (
						<div className="flex flex-1 flex-col">
							<BookingForm
								mentorSlug={mentorSlug}
								mentorName={mentorName}
								whenLabel={whenLabel}
								startAtUtc={selected}
								menteeTimezone={tz}
								onSuccess={() => {
									setOpen(false);
									setSelected(null);
								}}
							/>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
