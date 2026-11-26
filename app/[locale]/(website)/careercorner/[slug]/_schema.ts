import { CareerStage } from "@/src/db/schema/tables/bookings";
import { Gender } from "@/src/db/schema/tables/mentor-applications";
import { z } from "zod";

export const ListSlotsSchema = z.object({
	mentorSlug: z.string().min(1),
	fromUtc: z.string().datetime(),
	toUtc: z.string().datetime(),
});
export type ListSlotsInput = z.infer<typeof ListSlotsSchema>;

export const CreateBookingSchema = z.object({
	mentorSlug: z.string().min(1),
	startAtUtc: z.string().datetime(),
	menteeTimezone: z.string().min(1),

	mentee_name: z.string().min(2).max(120),
	mentee_email: z.string().email(),
	mentee_gender: Gender,
	purpose: z
		.string()
		.min(20, "Tell the mentor a bit more — at least 20 characters.")
		.max(2000),

	mentee_phone: z.string().max(40).optional().or(z.literal("")),
	mentee_linkedin: z.string().url().optional().or(z.literal("")),
	mentee_country: z.string().max(80).optional().or(z.literal("")),
	mentee_career_stage: CareerStage.optional(),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const bookingStatus = z.enum(["browsing", "form", "confirmed"]);
export type BookingStatus = z.infer<typeof bookingStatus>;

export const pickerStatus = z.enum([
	"error",
	"loading",
	"unavailable",
	"empty",
	"ready",
]);
export type PickerStatus = z.infer<typeof pickerStatus>;

export const DAYS_IN_WEEK = 7;
export const SLOTS_STALE_MS = 30_000;
export const SKELETON_SLOT_COUNT = 6;

export const COMMON_TIMEZONES = [
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
] as const;

export const GENDER_OPTIONS = [
	{ value: "female", labelKey: "female" },
	{ value: "male", labelKey: "male" },
	{ value: "non_binary", labelKey: "nonBinary" },
	{ value: "prefer_not_to_say", labelKey: "preferNotToSay" },
] as const;

export const CAREER_STAGE_OPTIONS = [
	{ value: "student", labelKey: "student" },
	{ value: "early_career", labelKey: "earlyCareer" },
	{ value: "mid_career", labelKey: "midCareer" },
	{ value: "founder", labelKey: "founder" },
	{ value: "other", labelKey: "other" },
] as const;
