"use server";

import {
	recordUnsubscribe,
	verifyUnsubscribeToken,
} from "@/src/lib/email-unsubscribe";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { z } from "zod";

export const unsubscribe = actionClient
	.schema(z.object({ e: z.string().min(1), t: z.string().min(1) }))
	.action(async ({ parsedInput }) => {
		if (!verifyUnsubscribeToken(parsedInput.e, parsedInput.t)) {
			throw new ActionError("Invalid link");
		}
		await recordUnsubscribe(parsedInput.e);
		return { ok: true };
	});
