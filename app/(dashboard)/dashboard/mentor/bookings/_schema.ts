import { z } from "zod";

export const BookingTab = z.enum(["upcoming", "past"]);
export type BookingTab = z.infer<typeof BookingTab>;
