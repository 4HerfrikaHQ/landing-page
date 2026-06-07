import { z } from "zod";

export const CompleteOnboardingSchema = z.object({
	token: z.string(),
	bio: z.string().min(20, "Bio should be at least 20 characters.").max(1000),
	nickname: z.string().max(60).optional().or(z.literal("")),
	image: z.string().url().optional().or(z.literal("")),
});

export type CompleteOnboardingInput = z.infer<typeof CompleteOnboardingSchema>;
