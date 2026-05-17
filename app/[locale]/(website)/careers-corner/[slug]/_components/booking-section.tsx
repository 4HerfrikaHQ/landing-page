"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { SlotPicker } from "@/components/booking/slot-picker";
import { BookingForm } from "./booking-form";

export function BookingSection({
	mentorSlug,
	mentorName,
}: {
	mentorSlug: string;
	mentorName: string;
}) {
	const [selected, setSelected] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const tz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";

	return (
		<>
			<SlotPicker
				mentorSlug={mentorSlug}
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
				<SheetContent className="overflow-y-auto sm:max-w-lg">
					<SheetHeader>
						<SheetTitle>Book with {mentorName}</SheetTitle>
						{selected && (
							<p className="text-sm text-gray-500">
								{formatInTimeZone(
									new Date(selected),
									tz,
									"EEEE, MMM d 'at' HH:mm zzz",
								)}
							</p>
						)}
					</SheetHeader>
					{selected && (
						<div className="px-4 pb-8">
							<BookingForm
								mentorSlug={mentorSlug}
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
