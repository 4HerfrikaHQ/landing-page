"use client";

import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { saveAvailability } from "@/src/db/actions/availability";
import type { DbAvailability } from "@/src/db/schema/tables";
import type { DayOfWeek } from "@/src/db/schema/tables";
import { cn } from "@/utils/cn";
import { CheckCircle2, Globe, PlusIcon, XIcon } from "lucide-react";
import { useState, useTransition } from "react";
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

function timeLabel(value: string) {
	return TIME_OPTIONS.find((t) => t.value === value)?.label ?? value;
}

export const TIMEZONES = [
	// Africa (default region — listed first)
	{ value: "Africa/Lagos", label: "West Africa Time — Lagos, Accra (WAT)" },
	{
		value: "Africa/Johannesburg",
		label: "Central/East Africa Time — Nairobi, Johannesburg",
	},
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

type AvailabilitySaveSlot = Omit<SlotRow, "tempId">;
type AvailabilitySaveAction = (
	slots: AvailabilitySaveSlot[],
	timezone: string,
) => Promise<{ error?: string }>;

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
			const previous = sorted[i - 1];
			if (current.start_time < previous.end_time) {
				const fmt = (t: string) =>
					TIME_OPTIONS.find((o) => o.value === t)?.label ?? t;
				errors.set(
					current.tempId,
					`Overlaps with ${fmt(previous.start_time)} – ${fmt(previous.end_time)}`,
				);
				errors.set(
					previous.tempId,
					`Overlaps with ${fmt(current.start_time)} – ${fmt(current.end_time)}`,
				);
			}
		}
	}

	return errors;
}

export function AvailabilityEditor({
	mentorId,
	initialSlots,
	saveAvailabilityAction,
}: {
	mentorId?: string;
	initialSlots: DbAvailability[];
	saveAvailabilityAction?: AvailabilitySaveAction;
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
		setSlotErrors((prev) => {
			const next = new Map(prev);
			next.delete(tempId);
			return next;
		});
	}

	function updateSlot(
		tempId: string,
		field: "start_time" | "end_time",
		value: string,
	) {
		setSlots((prev) =>
			prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s)),
		);
		setSlotErrors((prev) => {
			const next = new Map(prev);
			next.delete(tempId);
			return next;
		});
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
		const persistAvailability =
			saveAvailabilityAction ??
			(mentorId
				? (nextSlots: AvailabilitySaveSlot[], nextTimezone: string) =>
						saveAvailability(mentorId, nextSlots, nextTimezone)
				: null);
		if (!persistAvailability) {
			setError("Availability saving is not available.");
			return;
		}

		startTransition(async () => {
			const result = await persistAvailability(
				slots.map(({ tempId: _tempId, ...slot }) => slot),
				timezone,
			);
			if (result.error) {
				setError(result.error);
			} else {
				setSaved(true);
			}
		});
	}

	const totalSlots = slots.length;

	return (
		<div className="flex flex-col gap-6">
			{/* Timezone */}
			<DataCard>
				<DataCardSection className="space-y-2">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Timezone
					</p>
					<Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
						<SelectTrigger className="h-10 w-full text-sm">
							<span className="flex flex-1 items-center gap-2 truncate text-left">
								<Globe className="size-4 shrink-0 text-muted-foreground" />
								{TIMEZONES.find((tz) => tz.value === timezone)?.label ??
									timezone}
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
					<p className="text-xs text-muted-foreground">
						All slots below are interpreted in this timezone.
					</p>
				</DataCardSection>
			</DataCard>

			{/* Day sections */}
			<div className="flex flex-col gap-4">
				{DAYS_OF_WEEK.map((day) => {
					const daySlots = slots.filter((s) => s.day === day);
					return (
						<DataCard key={day}>
							<DataCardSection className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="font-heading text-sm font-semibold text-foreground">
										{day}
									</p>
									{daySlots.length === 0 ? (
										<span className="text-xs text-muted-foreground">
											Unavailable
										</span>
									) : (
										<span className="text-xs text-muted-foreground">
											{daySlots.length} slot{daySlots.length === 1 ? "" : "s"}
										</span>
									)}
								</div>

								<div className="flex flex-col gap-2">
									{daySlots.map((slot) => {
										const slotError = slotErrors.get(slot.tempId);
										return (
											<div key={slot.tempId} className="flex flex-col gap-1">
												<div
													className={cn(
														"flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 p-2",
														slotError &&
															"border-destructive/50 bg-destructive/5",
													)}
												>
													<Select
														value={slot.start_time}
														onValueChange={(v) =>
															v && updateSlot(slot.tempId, "start_time", v)
														}
													>
														<SelectTrigger className="h-9 flex-1 bg-white text-sm">
															<span className="flex flex-1 text-left">
																{timeLabel(slot.start_time)}
															</span>
														</SelectTrigger>
														<SelectContent>
															{TIME_OPTIONS.map((t) => (
																<SelectItem
																	key={t.value}
																	value={t.value}
																	label={t.label}
																>
																	{t.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>

													<span className="shrink-0 text-sm text-muted-foreground">
														→
													</span>

													<Select
														value={slot.end_time}
														onValueChange={(v) =>
															v && updateSlot(slot.tempId, "end_time", v)
														}
													>
														<SelectTrigger className="h-9 flex-1 bg-white text-sm">
															<span className="flex flex-1 text-left">
																{timeLabel(slot.end_time)}
															</span>
														</SelectTrigger>
														<SelectContent>
															{TIME_OPTIONS.map((t) => (
																<SelectItem
																	key={t.value}
																	value={t.value}
																	label={t.label}
																>
																	{t.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>

													<button
														type="button"
														onClick={() => removeSlot(slot.tempId)}
														className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
														aria-label="Remove slot"
													>
														<XIcon className="size-4" />
													</button>
												</div>
												{slotError ? (
													<p className="pl-1 text-xs text-destructive">
														{slotError}
													</p>
												) : null}
											</div>
										);
									})}

									<button
										type="button"
										onClick={() => addSlot(day)}
										className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary-500 hover:text-primary-500"
									>
										<PlusIcon className="size-4" />
										Add slot
									</button>
								</div>
							</DataCardSection>
						</DataCard>
					);
				})}
			</div>

			{/* Weekly preview */}
			{totalSlots > 0 ? (
				<DataCard>
					<DataCardSection className="space-y-3">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Weekly preview
						</p>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{DAYS_OF_WEEK.map((day) => {
								const daySlots = slots
									.filter((s) => s.day === day)
									.sort((a, b) => a.start_time.localeCompare(b.start_time));
								return (
									<div
										key={day}
										className="rounded-xl border border-border/60 bg-muted/30 p-3"
									>
										<p className="text-xs font-medium text-foreground">{day}</p>
										{daySlots.length === 0 ? (
											<p className="mt-1 text-xs text-muted-foreground">—</p>
										) : (
											<div className="mt-1.5 flex flex-wrap gap-1.5">
												{daySlots.map((slot) => (
													<span
														key={slot.tempId}
														className="inline-flex rounded-full bg-surface-pink px-2 py-0.5 text-xs font-medium text-primary-500"
													>
														{timeLabel(slot.start_time)} –{" "}
														{timeLabel(slot.end_time)}
													</span>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</DataCardSection>
				</DataCard>
			) : null}

			{error ? (
				<p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}

			<div className="flex items-center justify-end gap-3">
				{saved ? (
					<span className="inline-flex items-center gap-1.5 text-sm text-green-600">
						<CheckCircle2 className="size-4" />
						Availability saved
					</span>
				) : null}
				<Button
					type="button"
					variant="solid"
					size="sm"
					onClick={handleSave}
					disabled={isPending}
				>
					{isPending ? "Saving…" : "Save availability"}
				</Button>
			</div>
		</div>
	);
}
