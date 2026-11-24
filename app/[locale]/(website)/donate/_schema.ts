import {
	CURRENCIES,
	FREQUENCIES,
	isAmountWithinLimits,
} from "@/src/lib/paystack/amounts";
import { canCoverFee } from "@/src/lib/paystack/fee";
import { z } from "zod";

export const NOTE_MAX_LENGTH = 280;

export const giveInputSchema = z
	.object({
		frequency: z.enum(FREQUENCIES),
		currency: z.enum(CURRENCIES),
		amount: z.number().int(),
		coverFee: z.boolean(),
		name: z.string().trim().max(120),
		email: z.string().trim().max(254).pipe(z.email()),
		anonymous: z.boolean(),
		note: z.string().trim().max(NOTE_MAX_LENGTH),
	})
	.refine((input) => isAmountWithinLimits(input.amount, input.currency), {
		path: ["amount"],
	})
	.refine((input) => !input.coverFee || canCoverFee(input.currency), {
		path: ["coverFee"],
	});

export type GiveInput = z.infer<typeof giveInputSchema>;

export type StartGivingResult =
	| { status: "ready"; accessCode: string; reference: string }
	| { status: "error"; code: "invalid" | "unavailable" | "failed" };
