import { z } from "zod";

export const ApproveApplicationSchema = z.object({
	applicationId: z.string().uuid(),
});

export const RejectApplicationSchema = z.object({
	applicationId: z.string().uuid(),
	reason: z.string().max(500).optional(),
});
