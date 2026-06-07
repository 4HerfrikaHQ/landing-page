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
