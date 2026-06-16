"use client";

import { listMentorSlots } from "@/app/[locale]/(website)/careers-corner/[slug]/_actions";
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
import { useEffect, useMemo, useState } from "react";

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
}: {
	mentorSlug: string;
	initialWeekStart: string | null;
	selectedStartUtc: string | null;
	onSelect: (startUtc: string) => void;
}) {
	const [weekStart, setWeekStart] = useState(() =>
		initialWeekStart
			? startOfWeek(new Date(initialWeekStart), { weekStartsOn: 1 })
			: startOfWeek(new Date(), { weekStartsOn: 1 }),
	);
	const [tz, setTz] = useState("UTC");

	useEffect(() => {
		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC");
	}, []);

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

	const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
	const today = new Date();

	const totalSlots = query.data?.slots?.length ?? 0;
	const weekIsEmpty = !query.isPending && !query.isError && totalSlots === 0;

	const tzOptions = Array.from(new Set([tz, ...COMMON_TZS]));

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="Previous week"
						onClick={() => setWeekStart((w) => addDays(w, -7))}
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
						onClick={() => setWeekStart((w) => addDays(w, 7))}
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>

				<Select value={tz} onValueChange={(v) => v && setTz(v as string)}>
					<SelectTrigger className="h-9 gap-2 rounded-full bg-white">
						<Globe className="size-4 text-primary-500" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{tzOptions.map((t) => (
							<SelectItem key={t} value={t}>
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
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
					{Array.from({ length: 7 }).map((_, i) => (
						<div
							key={`skeleton-${i + 1}`}
							className="rounded-2xl border border-border/60 bg-white p-3"
						>
							<div className="h-3 w-8 animate-pulse rounded bg-muted" />
							<div className="mt-1.5 h-4 w-12 animate-pulse rounded bg-muted" />
							<div className="mt-3 space-y-1.5">
								<div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
								<div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
							</div>
						</div>
					))}
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
						onClick={() => setWeekStart((w) => addDays(w, 7))}
						className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:underline"
					>
						Try next week
						<ChevronRight className="size-4" />
					</button>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
					{days.map((day) => {
						const dayKey = formatInTimeZone(day, tz, "yyyy-MM-dd");
						const slots = slotsByDay.get(dayKey) ?? [];
						const isToday = isSameDay(day, today);
						return (
							<div
								key={dayKey}
								className={cn(
									"rounded-2xl border bg-white p-3 transition-colors",
									isToday
										? "border-primary-500/40 bg-surface-pink/60"
										: "border-border/60",
								)}
							>
								<div className="flex items-center justify-between">
									<p
										className={cn(
											"text-xs font-semibold uppercase tracking-wide",
											isToday ? "text-primary-500" : "text-muted-foreground",
										)}
									>
										{formatInTimeZone(day, tz, "EEE")}
									</p>
									{isToday && (
										<span className="rounded-full bg-primary-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-500">
											Today
										</span>
									)}
								</div>
								<p className="text-sm font-medium text-foreground">
									{formatInTimeZone(day, tz, "MMM d")}
								</p>
								<div className="mt-2.5 space-y-1.5">
									{slots.length === 0 && (
										<span className="inline-block rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
											—
										</span>
									)}
									{slots.map((s) => {
										const isSelected = s.startUtc === selectedStartUtc;
										return (
											<button
												key={s.startUtc}
												type="button"
												onClick={() => onSelect(s.startUtc)}
												className={cn(
													"block w-full rounded-lg border px-2 py-1.5 text-sm font-medium transition-all active:scale-[0.97]",
													isSelected
														? "border-primary-500 bg-primary-500 text-white shadow-[0_4px_14px_rgba(236,0,140,0.3)]"
														: "border-border/60 text-foreground hover:border-primary-500 hover:bg-surface-pink hover:text-primary-500",
												)}
											>
												{formatInTimeZone(new Date(s.startUtc), tz, "HH:mm")}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			)}

			<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<Globe className="size-3.5" />
				All times shown in {tz.replace(/_/g, " ")}.
			</p>
		</div>
	);
}
