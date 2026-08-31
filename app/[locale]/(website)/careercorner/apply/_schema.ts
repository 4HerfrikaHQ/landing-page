import { z } from "zod";

export const SubmitApplicationSchema = z.object({
	name: z.string().min(2).max(120),
	email: z.string().email(),
	phone: z.string().min(1, "Required").max(40),
	linkedin_url: z.string().url("Enter a valid LinkedIn URL"),
	country: z.string().min(1, "Required").max(80),
	bio: z.string().min(10, "Tell us a bit more — at least 10 characters.").max(1000),
	industry: z.string().min(1, "Required").max(100),
	cv_path: z.string().min(1, "Please upload your CV."),
});

export type SubmitApplicationInput = z.infer<typeof SubmitApplicationSchema>;
