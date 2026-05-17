import { z } from "zod";

export const ApproveApplicationSchema = z.object({
	applicationId: z.string().uuid(),
});
export type ApproveApplicationInput = z.infer<typeof ApproveApplicationSchema>;

export const RejectApplicationSchema = z.object({
	applicationId: z.string().uuid(),
	reason: z.string().max(500).optional(),
});
export type RejectApplicationInput = z.infer<typeof RejectApplicationSchema>;
