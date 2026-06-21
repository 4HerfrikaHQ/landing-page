import { z } from "zod";

export const BookingTab = z.enum(["upcoming", "past"]);
export type BookingTab = z.infer<typeof BookingTab>;

export const RescheduleMyBookingSchema = z.object({
	bookingId: z.string().uuid(),
	newStartUtc: z.string(),
});

export const CancelMyBookingSchema = z.object({
	bookingId: z.string().uuid(),
	reason: z.string().max(1000).optional(),
});

export const MarkNoShowSchema = z.object({
	bookingId: z.string().uuid(),
});
