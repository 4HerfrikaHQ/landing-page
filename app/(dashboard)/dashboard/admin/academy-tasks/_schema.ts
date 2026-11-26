import { z } from "zod";

export const NOTE_MAX_LENGTH = 1500;
export const QUEUE_PAGE_SIZE = 20;
export const DEFAULT_QUEUE_STATUS = "submitted";

export const reviewDecision = z.enum(["complete", "needs_work"]);
export type ReviewDecision = z.infer<typeof reviewDecision>;

export const reviewStep = z.enum(["writing", "confirming_complete"]);
export type ReviewStep = z.infer<typeof reviewStep>;

const submissionId = z.string().uuid();

export const ReviewTaskSchema = z.discriminatedUnion("decision", [
	z.object({
		submissionId,
		decision: z.literal(reviewDecision.enum.complete),
		note: z.string().trim().max(NOTE_MAX_LENGTH),
	}),
	z.object({
		submissionId,
		decision: z.literal(reviewDecision.enum.needs_work),
		note: z
			.string()
			.trim()
			.min(1, "Tell the learner what to change")
			.max(NOTE_MAX_LENGTH),
	}),
]);
