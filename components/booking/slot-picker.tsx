"use client";

import { listMentorSlots } from "@/app/[locale]/(website)/careercorner/[slug]/_actions";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { addDays, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarX2, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useQueryState } from "nuqs";
import { useMemo } from "react";

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

export function SlotPicker({
	mentorSlug,
	initialWeekStart,
	selectedStartUtc,
	onSelect,
	canSelectSlots = true,
}: {
	mentorSlug: string;
	initialWeekStart: string | null;
	selectedStartUtc: string | null;
	onSelect: (startUtc: string) => void;
	canSelectSlots?: boolean;
}) {
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
		// Let the new week auto-pick its first available day.
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
	const today = new Date();
	const dayKeys = days.map((d) => formatInTimeZone(d, tz, "yyyy-MM-dd"));
	const todayKey = formatInTimeZone(today, tz, "yyyy-MM-dd");

	const totalSlots = query.data?.slots?.length ?? 0;
	const weekIsEmpty = !query.isPending && !query.isError && totalSlots === 0;

	// Selected day: explicit choice if it's in this week and bookable, else the
	// first day with availability, else today (or the start of the week).
	const firstDayWithSlots = dayKeys.find(
		(k) => (slotsByDay.get(k)?.length ?? 0) > 0,
	);
	const selectedDayKey =
		dayParam && dayKeys.includes(dayParam) && (slotsByDay.get(dayParam)?.length ?? 0) > 0
			? dayParam
			: (firstDayWithSlots ??
				(dayKeys.includes(todayKey) ? todayKey : dayKeys[0]));
	const selectedDay = days[dayKeys.indexOf(selectedDayKey)] ?? days[0];
	const selectedSlots = slotsByDay.get(selectedDayKey) ?? [];

	const tzOptions = Array.from(new Set([tz, ...COMMON_TZS]));

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="Previous week"
						onClick={() => goToWeek(addDays(weekStart, -7))}
					>
						<ChevronLeft className="size-4" />
					</Button>
					<span className="min-w-44 text-center text-sm font-medium text-foreground">
						{format(weekStart, "MMM d")} –{" "}
						{format(addDays(weekStart, 6), "MMM d, yyyy")}
					</span>
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="Next week"
						onClick={() => goToWeek(addDays(weekStart, 7))}
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>

				<Select
					value={tz}
					onValueChange={(v) => v && setTzParam(v as string)}
				>
					<SelectTrigger className="h-9 gap-2 rounded-full bg-white">
						<Globe className="size-4 text-primary-500" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="max-h-72 w-56 p-1">
						{tzOptions.map((t) => (
							<SelectItem key={t} value={t} className="py-1.5">
								{t.replace(/_/g, " ")}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{query.isError && (
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
					{(query.error as Error)?.message ??
						"Couldn't load availability. Try again."}
				</div>
			)}

			{query.isPending ? (
				<div className="space-y-4">
					<div className="grid grid-cols-7 gap-1.5">
						{Array.from({ length: 7 }).map((_, i) => (
							<div
								key={`day-skeleton-${i + 1}`}
								className="h-14 animate-pulse rounded-xl bg-muted"
							/>
						))}
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={`slot-skeleton-${i + 1}`}
								className="h-9 animate-pulse rounded-lg bg-muted"
							/>
						))}
					</div>
				</div>
			) : weekIsEmpty ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-white/50 px-6 py-12 text-center">
					<span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-surface-pink text-primary-500">
						<CalendarX2 className="size-6" strokeWidth={1.75} />
					</span>
					<p className="text-sm font-medium text-foreground">
						No times open this week
					</p>
					<button
						type="button"
						onClick={() => goToWeek(addDays(weekStart, 7))}
						className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline"
					>
						Try next week
						<ChevronRight className="size-4" />
					</button>
				</div>
			) : (
				<div className="space-y-4">
					{/* Day selector */}
					<div className="grid grid-cols-7 gap-1.5">
						{days.map((day, i) => {
							const dayKey = dayKeys[i];
							const hasSlots = (slotsByDay.get(dayKey)?.length ?? 0) > 0;
							const isToday = isSameDay(day, today);
							const isSelected = dayKey === selectedDayKey;
							return (
								<button
									key={dayKey}
									type="button"
									disabled={!hasSlots}
									onClick={() => setDayParam(dayKey)}
									className={cn(
										"flex flex-col items-center rounded-xl border px-1 py-2 text-center transition-colors",
										isSelected
											? "border-primary-500 bg-primary-500 text-white shadow-[0_4px_14px_rgba(236,0,140,0.25)]"
											: hasSlots
												? "border-border/60 bg-white text-foreground hover:border-primary-500 hover:bg-surface-pink"
												: "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/50",
									)}
								>
									<span className="text-[10px] font-semibold uppercase tracking-wide">
										{formatInTimeZone(day, tz, "EEE")}
									</span>
									<span className="text-sm font-semibold">
										{formatInTimeZone(day, tz, "d")}
									</span>
									{isToday && (
										<span
											className={cn(
												"mt-0.5 size-1 rounded-full",
												isSelected ? "bg-white" : "bg-primary-500",
											)}
										/>
									)}
								</button>
							);
						})}
					</div>

					{/* Times for the selected day */}
					<div>
						<p className="mb-2.5 text-sm font-medium text-foreground">
							{formatInTimeZone(selectedDay, tz, "EEEE, MMM d")}
							{selectedDayKey === todayKey && (
								<span className="ml-1.5 text-xs font-normal text-primary-500">
									· today
								</span>
							)}
						</p>
						{selectedSlots.length === 0 ? (
							<p className="rounded-xl border border-dashed border-border/60 bg-white/50 px-4 py-6 text-center text-sm text-muted-foreground">
								No times open on this day.
							</p>
						) : (
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
								{selectedSlots.map((s) => {
									const isSelected = s.startUtc === selectedStartUtc;
									return (
										<button
											key={s.startUtc}
											type="button"
											disabled={!canSelectSlots}
											onClick={() => onSelect(s.startUtc)}
											className={cn(
												"rounded-lg border px-2 py-2 text-sm font-medium transition-all active:scale-[0.97] disabled:cursor-default disabled:opacity-70",
												isSelected
													? "border-primary-500 bg-primary-500 text-white shadow-[0_4px_14px_rgba(236,0,140,0.3)]"
													: canSelectSlots
														? "border-border/60 text-foreground hover:border-primary-500 hover:bg-surface-pink hover:text-primary-500"
														: "border-border/60 text-foreground",
											)}
										>
											{formatInTimeZone(new Date(s.startUtc), tz, "HH:mm")}
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}

			<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<Globe className="size-3.5" />
				All times shown in {tz.replace(/_/g, " ")}.
			</p>
		</div>
	);
}
