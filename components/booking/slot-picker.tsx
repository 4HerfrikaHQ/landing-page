"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { listMentorSlots } from "@/app/[locale]/(website)/careers-corner/[slug]/_actions";

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
	selectedStartUtc,
	onSelect,
}: {
	mentorSlug: string;
	selectedStartUtc: string | null;
	onSelect: (startUtc: string) => void;
}) {
	const [weekStart, setWeekStart] = useState(() =>
		startOfWeek(new Date(0), { weekStartsOn: 1 }),
	);
	const [tz, setTz] = useState("UTC");
	useEffect(() => {
		setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
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
			if (!groups.has(dayKey)) groups.set(dayKey, []);
			groups.get(dayKey)!.push(s);
		}
		return groups;
	}, [query.data, tz]);

	const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setWeekStart((w) => addDays(w, -7))}
					>
						← Prev
					</Button>
					<span className="text-sm font-medium">
						{format(weekStart, "MMM d")} –{" "}
						{format(addDays(weekStart, 6), "MMM d, yyyy")}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setWeekStart((w) => addDays(w, 7))}
					>
						Next →
					</Button>
				</div>
				<select
					className="rounded border px-2 py-1 text-sm bg-white"
					value={tz}
					onChange={(e) => setTz(e.target.value)}
				>
					{Array.from(new Set([tz, ...COMMON_TZS])).map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>
			</div>

			{query.isPending && (
				<p className="text-sm text-gray-500">Loading availability…</p>
			)}
			{query.isError && (
				<p className="text-sm text-red-500">
					{(query.error as Error)?.message ?? "Failed to load slots."}
				</p>
			)}

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
				{days.map((day) => {
					const dayKey = formatInTimeZone(day, tz, "yyyy-MM-dd");
					const slots = slotsByDay.get(dayKey) ?? [];
					return (
						<div key={dayKey} className="rounded-md border p-3 bg-white">
							<p className="text-xs font-medium uppercase tracking-wide text-gray-500">
								{formatInTimeZone(day, tz, "EEE")}
							</p>
							<p className="text-sm text-gray-900">
								{formatInTimeZone(day, tz, "MMM d")}
							</p>
							<div className="mt-2 space-y-1.5">
								{slots.length === 0 && (
									<p className="text-xs text-gray-400">—</p>
								)}
								{slots.map((s) => {
									const isSelected = s.startUtc === selectedStartUtc;
									return (
										<button
											key={s.startUtc}
											type="button"
											onClick={() => onSelect(s.startUtc)}
											className={`block w-full rounded border px-2 py-1 text-sm transition ${
												isSelected
													? "bg-primary text-primary-foreground border-primary"
													: "hover:bg-gray-50"
											}`}
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

			<p className="text-xs text-gray-500">All times shown in {tz}.</p>
		</div>
	);
}
