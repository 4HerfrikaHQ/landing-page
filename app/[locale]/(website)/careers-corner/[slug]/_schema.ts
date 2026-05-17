import { z } from "zod";

export const ListSlotsSchema = z.object({
	mentorSlug: z.string().min(1),
	fromUtc: z.string().datetime(),
	toUtc: z.string().datetime(),
});
export type ListSlotsInput = z.infer<typeof ListSlotsSchema>;
