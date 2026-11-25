import {
	CURRENCIES,
	FREQUENCIES,
	isAmountWithinLimits,
} from "@/src/lib/paystack/amounts";
import { canCoverFee } from "@/src/lib/paystack/fee";
import { z } from "zod";

export const NOTE_MAX_LENGTH = 280;
export const NAME_MAX_LENGTH = 120;

export const failureReason = z.enum(["cancelled", "error"]);
export type FailureReason = z.infer<typeof failureReason>;

export const startGivingErrorCode = z.enum([
	"invalid",
	"unavailable",
	"failed",
]);
export type StartGivingErrorCode = z.infer<typeof startGivingErrorCode>;

export const giveInputSchema = z
	.object({
		frequency: z.enum(FREQUENCIES),
		currency: z.enum(CURRENCIES),
		amount: z.number().int(),
		coverFee: z.boolean(),
		name: z.string().trim().max(NAME_MAX_LENGTH),
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
	| { status: "error"; code: StartGivingErrorCode };
