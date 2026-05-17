import { z } from "zod";

export const CancelBookingSchema = z.object({
	token: z.string(),
	reason: z.string().max(500).optional(),
});
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;

export const RescheduleBookingSchema = z.object({
	token: z.string(),
	newStartAtUtc: z.string().datetime(),
});
export type RescheduleBookingInput = z.infer<typeof RescheduleBookingSchema>;
