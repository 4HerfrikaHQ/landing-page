"use client";

import { SlotPicker } from "@/components/booking/slot-picker";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { trackEvent } from "@/src/lib/analytics";
import { formatInTimeZone } from "date-fns-tz";
import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
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
	const [selected, setSelected] = useQueryState("slot");
	const [tzParam] = useQueryState("tz");
	const viewedRef = useRef(false);

	useEffect(() => {
		if (viewedRef.current) return;
		viewedRef.current = true;
		trackEvent("mentor_booking_page_viewed", {
			mentor_slug: mentorSlug,
			mentor_name: mentorName,
		});
	}, [mentorName, mentorSlug]);

	const localTz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";
	const tz = tzParam ?? localTz;

	const open = selected != null;
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
					trackEvent("booking_slot_selected", { mentor_slug: mentorSlug });
					void setSelected(s);
				}}
			/>
			<Sheet
				open={open}
				onOpenChange={(o) => {
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
								onSuccess={() => setSelected(null)}
							/>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
