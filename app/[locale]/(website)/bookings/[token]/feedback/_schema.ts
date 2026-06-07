import { CallHappened } from "@/src/db/schema/tables/booking-feedback";
import { z } from "zod";

export const SubmitFeedbackSchema = z.object({
	token: z.string(),
	call_happened: CallHappened,
	rating: z.number().int().min(1).max(5).optional(),
	comment: z.string().max(2000).optional().or(z.literal("")),
	testimonial_consent: z.boolean().default(false),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;
