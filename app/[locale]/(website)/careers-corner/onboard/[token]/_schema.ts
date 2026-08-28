import { z } from "zod";

export const CompleteOnboardingSchema = z.object({
	token: z.string(),
	bio: z.string().min(20, "Bio should be at least 20 characters.").max(1000),
	nickname: z.string().max(60).optional().or(z.literal("")),
	image: z.string().url().optional().or(z.literal("")),
});

export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>;

export const ActivateOnboardingSchema = z.object({
	token: z.string(),
});

const OnboardingAvailabilitySlotSchema = z
	.object({
		day: z.enum([
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		]),
		start_time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/),
		end_time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/),
	})
	.superRefine((slot, context) => {
		if (slot.end_time <= slot.start_time) {
			context.addIssue({
				code: "custom",
				message: "End time must be after start time",
				path: ["end_time"],
			});
		}
	});

export const SaveOnboardingAvailabilitySchema = z.object({
	token: z.string().min(1),
	slots: z.array(OnboardingAvailabilitySlotSchema).max(100),
	timezone: z.string().min(1).max(100),
});

export type OnboardingAvailabilitySlot = z.infer<
	typeof OnboardingAvailabilitySlotSchema
>;
