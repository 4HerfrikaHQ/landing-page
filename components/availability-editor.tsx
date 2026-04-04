"use client";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { saveAvailability } from "@/src/db/actions/availability";
import type { DbAvailability } from "@/src/db/schema/tables";
import type { DayOfWeek } from "@/src/db/schema/tables";
import { PlusIcon, XIcon } from "lucide-react";
import { useTransition, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const DAYS_OF_WEEK: DayOfWeek[] = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

// 30-min increments, 6:00 AM – 11:30 PM
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let h = 6; h < 24; h++) {
	for (const m of [0, 30]) {
		const hh = String(h).padStart(2, "0");
		const mm = String(m).padStart(2, "0");
		const value = `${hh}:${mm}:00`;
		const period = h < 12 ? "AM" : "PM";
		const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
		const label = `${displayH}:${mm} ${period}`;
		TIME_OPTIONS.push({ value, label });
	}
}

export const TIMEZONES = [
	// Africa (default region — listed first)
	{ value: "Africa/Lagos", label: "West Africa Time — Lagos, Accra (WAT)" },
	{ value: "Africa/Johannesburg", label: "Central/East Africa Time — Nairobi, Johannesburg" },
	// US
	{ value: "America/New_York", label: "Eastern Time (US & Canada)" },
	{ value: "America/Chicago", label: "Central Time (US & Canada)" },
	{ value: "America/Denver", label: "Mountain Time (US & Canada)" },
	{ value: "America/Phoenix", label: "Arizona" },
	{ value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
	{ value: "America/Anchorage", label: "Alaska" },
	{ value: "Pacific/Honolulu", label: "Hawaii" },
	// Canada
	{ value: "America/Halifax", label: "Atlantic Time (Canada)" },
	{ value: "America/St_Johns", label: "Newfoundland" },
	// Europe
	{ value: "Europe/London", label: "London" },
	{ value: "Europe/Paris", label: "Paris, Brussels, Amsterdam" },
	{ value: "Europe/Berlin", label: "Berlin, Rome, Stockholm" },
	{ value: "Europe/Athens", label: "Athens, Istanbul" },
	{ value: "Europe/Moscow", label: "Moscow" },
	// Asia
	{ value: "Asia/Dubai", label: "Dubai" },
	{ value: "Asia/Kolkata", label: "Mumbai, Kolkata" },
	{ value: "Asia/Shanghai", label: "Beijing, Hong Kong, Singapore" },
	{ value: "Asia/Tokyo", label: "Tokyo, Osaka, Seoul" },
	// Australia
	{ value: "Australia/Sydney", label: "Sydney, Melbourne" },
	{ value: "Australia/Perth", label: "Perth" },
	// Other
	{ value: "UTC", label: "UTC" },
];

type SlotRow = {
	tempId: string;
	day: DayOfWeek;
	start_time: string;
	end_time: string;
};

// Returns a map of tempId → error message for any invalid slots.
// "HH:MM:SS" strings are zero-padded so lexicographic comparison is correct.
function validateSlots(slots: SlotRow[]): Map<string, string> {
	const errors = new Map<string, string>();

	for (const slot of slots) {
		if (slot.end_time <= slot.start_time) {
			errors.set(slot.tempId, "End time must be after start time");
		}
	}

	// Check overlaps within each day (only among slots not already flagged as backwards).
	// Sort by start_time then single pass: if slot[i] starts before slot[i-1] ends → overlap.
	// "HH:MM:SS" strings are zero-padded so lexicographic comparison is correct.
	const byDay = new Map<DayOfWeek, SlotRow[]>();
	for (const slot of slots) {
		if (!errors.has(slot.tempId)) {
			byDay.set(slot.day, [...(byDay.get(slot.day) ?? []), slot]);
		}
	}

	for (const daySlots of byDay.values()) {
		const sorted = [...daySlots].sort((a, b) =>
			a.start_time.localeCompare(b.start_time),
    );

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const previous = sorted[i - 1]
			if (current.start_time < previous.end_time) {
				errors.set(sorted[i].tempId, "Overlaps with another slot");
				errors.set(sorted[i - 1].tempId, "Overlaps with another slot");
			}
		}
	}

	return errors;
}

export function AvailabilityEditor({
	mentorId,
	initialSlots,
}: {
	mentorId: string;
	initialSlots: DbAvailability[];
}) {
	const [timezone, setTimezone] = useState(
		initialSlots[0]?.timezone ?? "Africa/Lagos",
	);
	const [slots, setSlots] = useState<SlotRow[]>(() =>
		initialSlots.map((s) => ({
			tempId: s.id,
			day: s.day,
			start_time: s.start_time,
			end_time: s.end_time,
		})),
	);
	const [slotErrors, setSlotErrors] = useState<Map<string, string>>(new Map());
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [isPending, startTransition] = useTransition();

	function addSlot(day: DayOfWeek) {
		setSlots((prev) => [
			...prev,
			{ tempId: uuidv4(), day, start_time: "09:00:00", end_time: "17:00:00" },
		]);
	}

	function removeSlot(tempId: string) {
		setSlots((prev) => prev.filter((s) => s.tempId !== tempId));
		setSlotErrors((prev) => { const next = new Map(prev); next.delete(tempId); return next; });
	}

	function updateSlot(
		tempId: string,
		field: "start_time" | "end_time",
		value: string,
	) {
		setSlots((prev) =>
			prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s)),
		);
		setSlotErrors((prev) => { const next = new Map(prev); next.delete(tempId); return next; });
	}

	function handleSave() {
		setError(null);
		setSaved(false);

		const validationErrors = validateSlots(slots);
		if (validationErrors.size > 0) {
			setSlotErrors(validationErrors);
			setError("Fix the highlighted slots before saving.");
			return;
    }

		setSlotErrors(new Map());

		startTransition(async () => {
			const result = await saveAvailability(mentorId, slots, timezone);
			if (result.error) {
				setError(result.error);
			} else {
				setSaved(true);
			}
		});
	}

	return (
		<div className="flex flex-col gap-5">
			{/* Timezone */}
			<div className="flex flex-col gap-1.5">
				<label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
					Timezone
				</label>
				<Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
					<SelectTrigger className="h-9 text-sm w-full">
						<span className="flex flex-1 text-left truncate">
							{TIMEZONES.find((tz) => tz.value === timezone)?.label ?? timezone}
						</span>
					</SelectTrigger>
					<SelectContent className="min-w-96">
						{TIMEZONES.map((tz) => (
							<SelectItem key={tz.value} value={tz.value} label={tz.label}>
								{tz.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Day sections */}
			<div className="flex flex-col gap-4">
				{DAYS_OF_WEEK.map((day) => {
					const daySlots = slots.filter((s) => s.day === day);
					return (
						<div key={day}>
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
								{day}
							</p>
							<div className="flex flex-col gap-2">
								{daySlots.map((slot) => {
									const slotError = slotErrors.get(slot.tempId);
									return (
										<div key={slot.tempId} className="flex flex-col gap-1">
											<div className="flex items-center gap-2">
												<Select
													value={slot.start_time}
													onValueChange={(v) => v && updateSlot(slot.tempId, "start_time", v)}
												>
													<SelectTrigger className={`h-8 text-sm flex-1 ${slotError ? "border-red-400" : ""}`}>
														<span className="flex flex-1 text-left">
															{TIME_OPTIONS.find((t) => t.value === slot.start_time)?.label ?? slot.start_time}
														</span>
													</SelectTrigger>
													<SelectContent>
														{TIME_OPTIONS.map((t) => (
															<SelectItem key={t.value} value={t.value} label={t.label}>
																{t.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												<span className="text-gray-400 text-sm shrink-0">→</span>

												<Select
													value={slot.end_time}
													onValueChange={(v) => v && updateSlot(slot.tempId, "end_time", v)}
												>
													<SelectTrigger className={`h-8 text-sm flex-1 ${slotError ? "border-red-400" : ""}`}>
														<span className="flex flex-1 text-left">
															{TIME_OPTIONS.find((t) => t.value === slot.end_time)?.label ?? slot.end_time}
														</span>
													</SelectTrigger>
													<SelectContent>
														{TIME_OPTIONS.map((t) => (
															<SelectItem key={t.value} value={t.value} label={t.label}>
																{t.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												<button
													type="button"
													onClick={() => removeSlot(slot.tempId)}
													className="text-gray-400 hover:text-red-400 transition-colors shrink-0"
													aria-label="Remove slot"
												>
													<XIcon className="size-3.5" />
												</button>
											</div>
											{slotError && (
												<p className="text-xs text-red-500 pl-0.5">{slotError}</p>
											)}
										</div>
									);
								})}

								<button
									type="button"
									onClick={() => addSlot(day)}
									className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors w-fit"
								>
									<PlusIcon className="size-3" />
									Add slot
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{error && (
				<p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
					{error}
				</p>
			)}

			{saved && (
				<p className="text-xs text-green-600 bg-green-50 border border-green-100 rounded-md px-3 py-2">
					Availability saved.
				</p>
			)}

			<Button
				type="button"
				variant="solid"
				size="sm"
				onClick={handleSave}
				disabled={isPending}
				className="self-end"
			>
				{isPending ? "Saving…" : "Save availability"}
			</Button>
		</div>
	);
}
