"use client";

import { useGiveFlow } from "../_hooks/use-give-flow";
import { ChooseStep } from "./choose-step";
import { DetailsStep } from "./details-step";
import { FailedStep, VerifyingStep } from "./status-steps";

export function GivingCard() {
	const { state, dispatch, charge, feeEstimateMinor, pay } = useGiveFlow();

	switch (state.status) {
		case "choose":
			return (
				<ChooseStep
					state={state}
					dispatch={dispatch}
					charge={charge}
					feeEstimateMinor={feeEstimateMinor}
				/>
			);
		case "details":
		case "paying":
			if (charge === null) return null;
			return (
				<DetailsStep
					state={state}
					dispatch={dispatch}
					charge={charge}
					onPay={pay}
				/>
			);
		case "verifying":
			return <VerifyingStep />;
		case "failed":
			return (
				<FailedStep reason={state.reason} dispatch={dispatch} onRetry={pay} />
			);
	}
}
