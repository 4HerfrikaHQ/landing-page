"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarX2, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { listMentorSlots } from "../_actions";
import { formatDayParts, formatSlotTime, formatWeekRange } from "../_format";

type Slot = { startUtc: string; endUtc: string };

const COMMON_TZS = [
	"Africa/Lagos",
	"Africa/Nairobi",
	"Africa/Johannesburg",
	"Africa/Cairo",
	"Africa/Accra",
	"Europe/London",
	"Europe/Paris",
	"America/New_York",
	"America/Los_Angeles",
	"Asia/Dubai",
	"UTC",
];

const FOCUS_RING =
	"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function SlotPicker({
	mentorSlug,
	displayName,
	initialWeekStart,
	selectedStartUtc,
	onSelect,
	canSelectSlots,
}: {
	mentorSlug: string;
	displayName: string;
	initialWeekStart: string | null;
	selectedStartUtc: string | null;
	onSelect: (startUtc: string) => void;
	canSelectSlots: boolean;
}) {
	const t = useTranslations("mentorProfile.slots");
	const locale = useLocale();
	const [weekParam, setWeekParam] = useQueryState("week");
	const [dayParam, setDayParam] = useQueryState("day");
	const [tzParam, setTzParam] = useQueryState("tz");

	const localTz =
		typeof Intl !== "undefined"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: "UTC";
	const tz = tzParam ?? localTz;

	const weekStart = useMemo(() => {
		const base = weekParam ?? initialWeekStart;
		return startOfWeek(base ? new Date(base) : new Date(), {
			weekStartsOn: 1,
		});
	}, [weekParam, initialWeekStart]);

	function goToWeek(date: Date) {
		setWeekParam(format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"));
		setDayParam(null);
	}

	const fromUtc = useMemo(() => weekStart.toISOString(), [weekStart]);
	const toUtc = useMemo(
		() => endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString(),
		[weekStart],
	);

	const { executeAsync } = useAction(listMentorSlots);

	const query = useQuery({
		queryKey: ["slots", mentorSlug, fromUtc, toUtc],
		queryFn: async () => {
			const res = await executeAsync({ mentorSlug, fromUtc, toUtc });
			if (res?.serverError) throw new Error(res.serverError);
			if (!res?.data) throw new Error("Failed to load slots");
			return res.data;
		},
		staleTime: 30_000,
	});

	const slotsByDay = useMemo(() => {
		const groups = new Map<string, Slot[]>();
		for (const s of query.data?.slots ?? []) {
			const dayKey = formatInTimeZone(new Date(s.startUtc), tz, "yyyy-MM-dd");
			let daySlots = groups.get(dayKey);
			if (!daySlots) {
				daySlots = [];
				groups.set(dayKey, daySlots);
			}
			daySlots.push(s);
		}
		return groups;
	}, [query.data, tz]);

	const days = useMemo(
		() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
		[weekStart],
	);
	const dayKeys = days.map((d) => formatInTimeZone(d, tz, "yyyy-MM-dd"));
	const todayKey = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");

	const totalSlots = query.data?.slots?.length ?? 0;
	const bookingUnavailable = query.data?.bookingUnavailable === true;
	const weekIsEmpty = !query.isPending && !query.isError && totalSlots === 0;

	const firstDayWithSlots = dayKeys.find(
		(k) => (slotsByDay.get(k)?.length ?? 0) > 0,
	);
	const selectedDayKey =
		dayParam &&
		dayKeys.includes(dayParam) &&
		(slotsByDay.get(dayParam)?.length ?? 0) > 0
			? dayParam
			: (firstDayWithSlots ??
				(dayKeys.includes(todayKey) ? todayKey : dayKeys[0]));
	const selectedDay = days[dayKeys.indexOf(selectedDayKey)] ?? days[0];
	const selectedSlots = slotsByDay.get(selectedDayKey) ?? [];

	const tzOptions = Array.from(new Set([tz, ...COMMON_TZS]));
	const range = formatWeekRange(weekStart, addDays(weekStart, 6), locale);
	const rangeLabel = t("weekRange", { start: range.start, end: range.end });
	const tzLabel = tz.replace(/_/g, " ");

	return (
		<div className="space-y-4" aria-busy={query.isPending}>
			{!bookingUnavailable && (
				<div className="flex items-center justify-between gap-2">
					<button
						type="button"
						aria-label={t("previousWeek")}
						onClick={() => goToWeek(addDays(weekStart, -7))}
						className={cn(
							"grid size-11 shrink-0 place-items-center rounded-pill border border-border bg-white transition-colors hover:border-primary hover:text-primary",
							FOCUS_RING,
						)}
					>
						<ChevronLeft className="size-4" aria-hidden="true" />
					</button>
					<span
						aria-live="polite"
						className="text-center text-[15px] font-medium leading-tight"
					>
						{rangeLabel}
					</span>
					<button
						type="button"
						aria-label={t("nextWeek")}
						onClick={() => goToWeek(addDays(weekStart, 7))}
						className={cn(
							"grid size-11 shrink-0 place-items-center rounded-pill border border-border bg-white transition-colors hover:border-primary hover:text-primary",
							FOCUS_RING,
						)}
					>
						<ChevronRight className="size-4" aria-hidden="true" />
					</button>
				</div>
			)}

			{query.isError && (
				<div
					role="alert"
					className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
				>
					{t("loadError")}
				</div>
			)}

			{query.isPending && (
				<div className="space-y-4">
					<div className="grid grid-cols-7 gap-1.5">
						{Array.from({ length: 7 }).map((_, i) => (
							<div
								key={`day-skeleton-${i + 1}`}
								className="h-14 rounded-xl bg-muted motion-safe:animate-pulse"
							/>
						))}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={`slot-skeleton-${i + 1}`}
								className="h-11 rounded-xl bg-muted motion-safe:animate-pulse"
							/>
						))}
					</div>
				</div>
			)}

			{bookingUnavailable && (
				<div className="flex flex-col items-center rounded-[24px] border border-dashed border-primary/30 bg-surface-pink/60 px-6 py-10 text-center">
					<span className="mb-3 grid size-12 place-items-center rounded-pill bg-surface-pink text-primary">
						<CalendarX2
							className="size-6"
							strokeWidth={1.75}
							aria-hidden="true"
						/>
					</span>
					<p className="font-semibold">{t("unavailableTitle")}</p>
					<p className="mt-1 text-[15px] text-muted-foreground">
						{t("unavailableBody")}
					</p>
				</div>
			)}

			{weekIsEmpty && !bookingUnavailable && (
				<div className="flex flex-col items-center rounded-[24px] border border-dashed border-primary/30 bg-surface-pink/60 px-6 py-10 text-center">
					<span className="mb-3 grid size-12 place-items-center rounded-pill bg-surface-pink text-primary">
						<CalendarX2
							className="size-6"
							strokeWidth={1.75}
							aria-hidden="true"
						/>
					</span>
					<p className="font-semibold">{t("emptyTitle")}</p>
					<p className="mt-1 text-[15px] text-muted-foreground">
						{t("emptyBody", { name: displayName, range: rangeLabel })}
					</p>
					<button
						type="button"
						onClick={() => goToWeek(addDays(weekStart, 7))}
						className={cn(
							"mt-4 inline-flex h-12 items-center justify-center gap-1 rounded-pill bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary-700",
							FOCUS_RING,
						)}
					>
						{t("tryNextWeek")}
						<ChevronRight className="size-4" aria-hidden="true" />
					</button>
				</div>
			)}

			{!query.isPending &&
				!query.isError &&
				!bookingUnavailable &&
				!weekIsEmpty && (
					<div className="space-y-4">
						<fieldset className="grid min-w-0 grid-cols-7 gap-1.5 border-0 p-0">
							<legend className="sr-only">{t("pickDay")}</legend>
							{days.map((day, i) => {
								const dayKey = dayKeys[i];
								const hasSlots = (slotsByDay.get(dayKey)?.length ?? 0) > 0;
								const isSelected = dayKey === selectedDayKey;
								const parts = formatDayParts(day, locale, tz);
								return (
									<button
										key={dayKey}
										type="button"
										disabled={!hasSlots}
										aria-pressed={isSelected}
										aria-label={parts.long}
										onClick={() => setDayParam(dayKey)}
										className={cn(
											"flex min-h-14 flex-col items-center justify-center rounded-xl border px-0.5 py-2 text-center transition-colors",
											FOCUS_RING,
											isSelected
												? "border-primary bg-primary text-white shadow-[0_4px_14px_rgba(200,0,122,0.25)]"
												: hasSlots
													? "border-border bg-white hover:border-primary hover:bg-surface-pink"
													: "cursor-not-allowed border-border/60 bg-muted text-[#6b6d85]",
										)}
									>
										<span
											className={cn(
												"text-[11px]",
												!isSelected && hasSlots && "text-muted-foreground",
											)}
										>
											{parts.weekday}
										</span>
										<span className="font-semibold">{parts.day}</span>
									</button>
								);
							})}
						</fieldset>

						<div>
							<div className="flex items-center justify-between gap-2">
								<p className="text-[15px] font-medium">
									{formatDayParts(selectedDay, locale, tz).long}
									{selectedDayKey === todayKey && (
										<span className="ml-1.5 text-xs font-normal text-primary">
											· {t("today")}
										</span>
									)}
								</p>
								<Select
									value={tz}
									onValueChange={(v) => v && setTzParam(v as string)}
								>
									<SelectTrigger
										aria-label={t("timezone")}
										className={cn(
											"h-11 w-auto max-w-[11rem] gap-1.5 rounded-full data-[size=default]:h-11 border-border bg-white px-3 text-sm",
											FOCUS_RING,
										)}
									>
										<Globe className="size-4 text-primary" aria-hidden="true" />
										<SelectValue>{tzLabel}</SelectValue>
									</SelectTrigger>
									<SelectContent className="max-h-72 w-56 p-1">
										{tzOptions.map((option) => (
											<SelectItem key={option} value={option} className="py-2">
												{option.replace(/_/g, " ")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{selectedSlots.length === 0 ? (
								<p className="mt-3 rounded-xl border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-muted-foreground">
									{t("noTimesDay")}
								</p>
							) : (
								<div className="mt-3 grid grid-cols-3 gap-2">
									{selectedSlots.map((s) => {
										const isSelected = s.startUtc === selectedStartUtc;
										return (
											<button
												key={s.startUtc}
												type="button"
												disabled={!canSelectSlots}
												aria-pressed={isSelected}
												onClick={() => onSelect(s.startUtc)}
												className={cn(
													"h-11 rounded-xl border text-[15px] font-medium transition-all disabled:cursor-default motion-safe:active:scale-[0.97]",
													FOCUS_RING,
													isSelected
														? "border-primary bg-primary text-white shadow-[0_4px_14px_rgba(200,0,122,0.3)]"
														: canSelectSlots
															? "border-border bg-white hover:border-primary hover:bg-surface-pink hover:text-primary"
															: "border-border bg-white",
												)}
											>
												{formatSlotTime(s.startUtc, locale, tz)}
											</button>
										);
									})}
								</div>
							)}
						</div>
					</div>
				)}

			{!bookingUnavailable && (
				<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Globe className="size-4 shrink-0" aria-hidden="true" />
					{t("allTimesIn", { timezone: tzLabel })}
				</p>
			)}
		</div>
	);
}
