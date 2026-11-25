import { z } from "zod";
import { NOTE_MAX_LENGTH } from "./_helpers";

const submissionId = z.string().uuid();

export const ReviewTaskSchema = z.discriminatedUnion("decision", [
	z.object({
		submissionId,
		decision: z.literal("complete"),
		note: z.string().trim().max(NOTE_MAX_LENGTH),
	}),
	z.object({
		submissionId,
		decision: z.literal("needs_work"),
		note: z
			.string()
			.trim()
			.min(1, "Tell the learner what to change")
			.max(NOTE_MAX_LENGTH),
	}),
]);
