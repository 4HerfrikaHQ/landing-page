"use server";

import {
	recordResubscribe,
	recordUnsubscribe,
	verifyUnsubscribeToken,
} from "@/src/lib/email-unsubscribe";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { z } from "zod";

const linkSchema = z.object({ e: z.string().min(1), t: z.string().min(1) });

export const unsubscribe = actionClient
	.schema(linkSchema)
	.action(async ({ parsedInput }) => {
		if (!verifyUnsubscribeToken(parsedInput.e, parsedInput.t)) {
			throw new ActionError("Invalid link");
		}
		await recordUnsubscribe(parsedInput.e);
		return { ok: true };
	});

export const resubscribe = actionClient
	.schema(linkSchema)
	.action(async ({ parsedInput }) => {
		if (!verifyUnsubscribeToken(parsedInput.e, parsedInput.t)) {
			throw new ActionError("Invalid link");
		}
		await recordResubscribe(parsedInput.e);
		return { ok: true };
	});
