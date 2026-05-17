"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { SlotPicker } from "@/components/booking/slot-picker";

export function BookingSection({
	mentorSlug,
	mentorName,
}: {
	mentorSlug: string;
	mentorName: string;
}) {
	const [selected, setSelected] = useState<string | null>(null);
	const tz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";

	return (
		<div className="space-y-6">
			<SlotPicker
				mentorSlug={mentorSlug}
				selectedStartUtc={selected}
				onSelect={setSelected}
			/>

			{selected && (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
					You picked{" "}
					{formatInTimeZone(
						new Date(selected),
						tz,
						"EEEE, MMM d 'at' HH:mm zzz",
					)}{" "}
					with {mentorName}. Booking form coming next.
				</div>
			)}
		</div>
	);
}
