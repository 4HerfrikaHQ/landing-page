import {
	type Currency,
	DEFAULT_AMOUNTS,
	type Frequency,
	isAmountWithinLimits,
	parseAmount,
} from "@/src/lib/paystack/amounts";
import { canCoverFee } from "@/src/lib/paystack/fee";
import type { FailureReason } from "../_schema";

export type AmountChoice =
	| { kind: "preset"; amount: number }
	| { kind: "custom"; text: string };

export type Gift = {
	frequency: Frequency;
	currency: Currency;
	choice: AmountChoice;
	coverFee: boolean;
};

export type Donor = {
	name: string;
	email: string;
	anonymous: boolean;
	note: string;
};

export type GiveState = {
	gift: Gift;
	donor: Donor;
} & (
	| { status: "choose"; amountInvalid: boolean }
	| { status: "details"; emailInvalid: boolean }
	| { status: "paying" }
	| { status: "verifying"; reference: string }
	| { status: "failed"; reason: FailureReason }
);

export type GiveAction =
	| { type: "gift-changed"; gift: Partial<Gift> }
	| { type: "currency-changed"; currency: Currency }
	| { type: "donor-changed"; donor: Partial<Donor> }
	| { type: "continued" }
	| { type: "went-back" }
	| { type: "submitted"; emailValid: boolean }
	| { type: "payment-started" }
	| { type: "payment-succeeded"; reference: string }
	| { type: "payment-failed"; reason: FailureReason };

export function defaultChoice(currency: Currency): AmountChoice {
	return { kind: "preset", amount: DEFAULT_AMOUNTS[currency] };
}

export function initialGiveState(): GiveState {
	return {
		status: "choose",
		amountInvalid: false,
		gift: {
			frequency: "monthly",
			currency: "NGN",
			choice: defaultChoice("NGN"),
			coverFee: false,
		},
		donor: { name: "", email: "", anonymous: false, note: "" },
	};
}

export function resolveAmount(gift: Gift): number | null {
	const amount =
		gift.choice.kind === "preset"
			? gift.choice.amount
			: parseAmount(gift.choice.text);
	if (amount === null) return null;
	return isAmountWithinLimits(amount, gift.currency) ? amount : null;
}

export function giveReducer(state: GiveState, action: GiveAction): GiveState {
	const { gift, donor } = state;
	switch (action.type) {
		case "gift-changed":
			return {
				gift: { ...gift, ...action.gift },
				donor,
				status: "choose",
				amountInvalid: false,
			};
		case "currency-changed":
			return {
				gift: {
					...gift,
					currency: action.currency,
					choice: defaultChoice(action.currency),
					coverFee: canCoverFee(action.currency) ? gift.coverFee : false,
				},
				donor,
				status: "choose",
				amountInvalid: false,
			};
		case "donor-changed":
			return {
				gift,
				donor: { ...donor, ...action.donor },
				status: "details",
				emailInvalid: false,
			};
		case "continued":
			if (resolveAmount(gift) === null) {
				return { gift, donor, status: "choose", amountInvalid: true };
			}
			return { gift, donor, status: "details", emailInvalid: false };
		case "went-back":
			return { gift, donor, status: "choose", amountInvalid: false };
		case "submitted":
			if (!action.emailValid) {
				return { gift, donor, status: "details", emailInvalid: true };
			}
			return state;
		case "payment-started":
			return { gift, donor, status: "paying" };
		case "payment-succeeded":
			return { gift, donor, status: "verifying", reference: action.reference };
		case "payment-failed":
			return { gift, donor, status: "failed", reason: action.reason };
	}
}
