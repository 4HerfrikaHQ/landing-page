import { z } from "zod";

/** A booking can be rescheduled only this many hours before it starts. */
export const RESCHEDULE_MIN_NOTICE_HOURS = 24;

const RESCHEDULE_MIN_NOTICE_MS = RESCHEDULE_MIN_NOTICE_HOURS * 60 * 60 * 1000;

/** True only when the call is more than the minimum notice ahead of `nowMs`. */
export function canReschedule(startAtMs: number, nowMs: number): boolean {
	return startAtMs - nowMs > RESCHEDULE_MIN_NOTICE_MS;
}

/** Upper bound for a mentor's configurable booking notice (one week). */
export const MIN_LEAD_HOURS_MAX = 168;

export const MinLeadHoursSchema = z
	.number()
	.int()
	.min(0)
	.max(MIN_LEAD_HOURS_MAX);
