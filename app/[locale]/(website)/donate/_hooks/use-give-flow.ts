"use client";

import { useRouter } from "@/i18n/navigation";
import { canCoverFee, chargeFor } from "@/src/lib/paystack/fee";
import type { Route } from "next";
import { useReducer } from "react";
import { startGiving } from "../_actions";
import {
	giveReducer,
	initialGiveState,
	resolveAmount,
} from "../_lib/give-state";
import { openPaystackPopup } from "../_lib/paystack-popup";
import { failureReason } from "../_schema";

const FAILURE = failureReason.def.entries;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useGiveFlow() {
	const [state, dispatch] = useReducer(
		giveReducer,
		undefined,
		initialGiveState,
	);
	const router = useRouter();

	const amount = resolveAmount(state.gift);
	const charge =
		amount === null
			? null
			: chargeFor(amount, state.gift.currency, state.gift.coverFee);

	const feeEstimateMinor =
		amount === null || !canCoverFee(state.gift.currency)
			? null
			: chargeFor(amount, state.gift.currency, true).feeMinor;

	async function pay() {
		const emailValid = EMAIL_PATTERN.test(state.donor.email.trim());
		dispatch({ type: "submitted", emailValid });
		if (!emailValid || amount === null) return;

		dispatch({ type: "payment-started" });
		const result = await startGiving({
			frequency: state.gift.frequency,
			currency: state.gift.currency,
			amount,
			coverFee: state.gift.coverFee,
			name: state.donor.name,
			email: state.donor.email,
			anonymous: state.donor.anonymous,
			note: state.donor.note,
		});

		if (result.status === "error") {
			dispatch({ type: "payment-failed", reason: FAILURE.error });
			return;
		}

		try {
			await openPaystackPopup(result.accessCode, {
				onSuccess: () => {
					dispatch({
						type: "payment-succeeded",
						reference: result.reference,
					});
					router.push(
						`/donate/thank-you?reference=${encodeURIComponent(result.reference)}` as Route,
					);
				},
				onCancel: () =>
					dispatch({ type: "payment-failed", reason: FAILURE.cancelled }),
				onError: () =>
					dispatch({ type: "payment-failed", reason: FAILURE.error }),
			});
		} catch {
			dispatch({ type: "payment-failed", reason: FAILURE.error });
		}
	}

	return { state, dispatch, amount, charge, feeEstimateMinor, pay };
}
