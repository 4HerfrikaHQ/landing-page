import { Gender } from "@/src/db/schema/tables/mentor-applications";
import { z } from "zod";

export const SubmitApplicationSchema = z.object({
	name: z.string().min(2).max(120),
	email: z.string().email(),
	phone: z.string().max(40).optional().or(z.literal("")),
	linkedin_url: z.string().url().optional().or(z.literal("")),
	country: z.string().max(80).optional().or(z.literal("")),
	position: z.string().min(2).max(120),
	bio: z.string().max(1000).optional().or(z.literal("")),
	gender: Gender.optional(),
	expertise_areas: z.array(z.string().min(1).max(60)).max(10).default([]),
	motivation: z
		.string()
		.min(40, "Tell us a bit more — at least 40 characters.")
		.max(2000),
});

export type SubmitApplicationInput = z.infer<typeof SubmitApplicationSchema>;
