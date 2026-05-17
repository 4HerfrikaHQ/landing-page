import { addDays, addMinutes, isAfter, isBefore, startOfDay } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { DayOfWeek } from "@/src/db/schema/tables/availability";

const DAY_INDEX: Record<DayOfWeek, number> = {
	Sunday: 0,
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
};

type Template = {
	day: DayOfWeek;
	start_time: string;
	end_time: string;
	timezone: string;
};
type Booking = { startUtc: Date; endUtc: Date };
type Settings = {
	session_duration_minutes: number;
	min_lead_hours: number;
	max_horizon_days: number;
	buffer_minutes: number;
};

export type ComputedSlot = {
	startUtc: string;
	endUtc: string;
};

export function computeSlots(opts: {
	availabilityTemplates: Template[];
	existingBookings: Booking[];
	settings: Settings;
	fromUtc: Date;
	toUtc: Date;
	now: Date;
}): ComputedSlot[] {
	const { availabilityTemplates, existingBookings, settings, fromUtc, toUtc, now } = opts;

	const earliest = addMinutes(now, settings.min_lead_hours * 60);
	const latest = addDays(now, settings.max_horizon_days);

	const seen = new Map<string, ComputedSlot>();

	for (let d = startOfDay(fromUtc); isBefore(d, toUtc); d = addDays(d, 1)) {
		for (const tpl of availabilityTemplates) {
			const localDateStr = formatInTimeZone(d, tpl.timezone, "yyyy-MM-dd");
			const localDayName = formatInTimeZone(d, tpl.timezone, "EEEE") as DayOfWeek;
			if (DAY_INDEX[localDayName] !== DAY_INDEX[tpl.day]) continue;

			// availability stores "HH:MM:SS" — trim to HH:MM for ISO compatibility
			const start = tpl.start_time.slice(0, 5);
			const end = tpl.end_time.slice(0, 5);
			const windowStartUtc = fromZonedTime(`${localDateStr}T${start}:00`, tpl.timezone);
			const windowEndUtc = fromZonedTime(`${localDateStr}T${end}:00`, tpl.timezone);

			for (
				let s = windowStartUtc;
				!isAfter(addMinutes(s, settings.session_duration_minutes), windowEndUtc);
				s = addMinutes(s, settings.session_duration_minutes)
			) {
				const slotEnd = addMinutes(s, settings.session_duration_minutes);
				if (isBefore(s, earliest)) continue;
				if (isAfter(s, latest)) continue;

				const blocked = existingBookings.some((b) =>
					rangesOverlap(
						s,
						slotEnd,
						addMinutes(b.startUtc, -settings.buffer_minutes),
						addMinutes(b.endUtc, settings.buffer_minutes),
					),
				);
				if (blocked) continue;

				const iso = s.toISOString();
				if (!seen.has(iso)) {
					seen.set(iso, { startUtc: iso, endUtc: slotEnd.toISOString() });
				}
			}
		}
	}

	return Array.from(seen.values()).sort((a, b) =>
		a.startUtc.localeCompare(b.startUtc),
	);
}

function rangesOverlap(
	aStart: Date,
	aEnd: Date,
	bStart: Date,
	bEnd: Date,
): boolean {
	return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
