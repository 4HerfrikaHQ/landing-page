"use client";

import { LayoutMotion } from "@/components/ui/layout-motion";
import {
	AMOUNT_LIMITS,
	CURRENCIES,
	CURRENCY_SYMBOLS,
	type Currency,
	FREQUENCIES,
	type Frequency,
	PRESET_AMOUNTS,
	formatAmount,
	fromMinorUnits,
	isCurrency,
	isFrequency,
} from "@/src/lib/paystack/amounts";
import { type ChargeBreakdown, canCoverFee } from "@/src/lib/paystack/fee";
import { ArrowRight, Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Dispatch } from "react";
import type { GiveAction, GiveState } from "../_lib/give-state";
import { OptionTile, SegmentedRadio } from "./give-controls";

const DISPLAY_FREQUENCIES = [...FREQUENCIES].reverse();

const CURRENCY_LABEL_KEYS = {
	NGN: "ngn",
	USD: "usd",
} as const satisfies Record<Currency, string>;

const SUMMARY_KEYS = {
	monthly: "summaryMonthly",
	once: "summaryOnce",
} as const satisfies Record<Frequency, string>;

type ChooseState = Extract<GiveState, { status: "choose" }>;

export function ChooseStep({
	state,
	dispatch,
	charge,
	feeEstimateMinor,
}: {
	state: ChooseState;
	dispatch: Dispatch<GiveAction>;
	charge: ChargeBreakdown | null;
	feeEstimateMinor: number | null;
}) {
	const t = useTranslations("donate.flow.choose");
	const locale = useLocale();
	const { gift, amountInvalid } = state;
	const money = (amount: number) => formatAmount(amount, gift.currency, locale);
	const limits = AMOUNT_LIMITS[gift.currency];
	const symbol = CURRENCY_SYMBOLS[gift.currency];
	const customText = gift.choice.kind === "custom" ? gift.choice.text : "";
	const total =
		charge === null ? "—" : money(fromMinorUnits(charge.chargeMinor));
	const amountMessage = t(amountInvalid ? "amountError" : "amountHelp", {
		min: money(limits.min),
		max: money(limits.max),
	});

	return (
		<LayoutMotion>
			<form
				aria-label={t("formLabel")}
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					dispatch({ type: "continued" });
				}}
				className="flex flex-col gap-6"
			>
				<p className="text-sm font-semibold text-muted-foreground">
					{t("step")} <span className="text-foreground">{t("stepName")}</span>
				</p>

				<SegmentedRadio
					legend={t("frequencyLegend")}
					name="frequency"
					value={gift.frequency}
					options={DISPLAY_FREQUENCIES.map((value) => ({
						value,
						label: t(value),
					}))}
					onChange={(value) => {
						if (isFrequency(value)) {
							dispatch({ type: "gift-changed", gift: { frequency: value } });
						}
					}}
				/>

				<SegmentedRadio
					legend={t("currencyLegend")}
					name="currency"
					value={gift.currency}
					options={CURRENCIES.map((value) => ({
						value,
						label: t(CURRENCY_LABEL_KEYS[value]),
					}))}
					onChange={(value) => {
						if (isCurrency(value)) {
							dispatch({ type: "currency-changed", currency: value });
						}
					}}
				/>

				<fieldset className="min-w-0">
					<legend className="text-sm font-semibold">{t("amountLegend")}</legend>
					<div className="mt-3 grid grid-cols-2 gap-3">
						{PRESET_AMOUNTS[gift.currency].map((amount) => (
							<OptionTile
								key={amount}
								name="amount"
								checked={
									gift.choice.kind === "preset" && gift.choice.amount === amount
								}
								onChange={() =>
									dispatch({
										type: "gift-changed",
										gift: { choice: { kind: "preset", amount } },
									})
								}
							>
								{money(amount)}
							</OptionTile>
						))}
					</div>
					<label className="mt-3 flex h-12 items-center gap-2 rounded-xl border border-input bg-white px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500">
						<span aria-hidden="true" className="text-muted-foreground">
							{symbol}
						</span>
						<span className="sr-only">{t("customLabel")}</span>
						<input
							name="custom-amount"
							inputMode="numeric"
							autoComplete="off"
							value={customText}
							placeholder={t("customPlaceholder")}
							aria-invalid={amountInvalid}
							aria-describedby="amount-help"
							onChange={(event) =>
								dispatch({
									type: "gift-changed",
									gift: {
										choice: { kind: "custom", text: event.target.value },
									},
								})
							}
							className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
						/>
					</label>
					<p
						id="amount-help"
						role={amountInvalid ? "alert" : undefined}
						data-invalid={amountInvalid}
						className="mt-2 text-xs text-muted-foreground data-[invalid=true]:font-medium data-[invalid=true]:text-destructive"
					>
						{amountMessage}
					</p>
				</fieldset>

				<FeeCover
					gift={gift}
					feeEstimateMinor={feeEstimateMinor}
					onChange={(coverFee) =>
						dispatch({ type: "gift-changed", gift: { coverFee } })
					}
				/>

				<div className="flex items-center justify-between rounded-xl bg-surface-pink px-4 py-3">
					<span className="text-sm text-muted-foreground">
						{t(SUMMARY_KEYS[gift.frequency])}
					</span>
					<span className="text-xl font-semibold tabular-nums text-primary-500">
						{total}
					</span>
				</div>

				<button
					type="submit"
					className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-500 px-8 text-lg font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500"
				>
					{t("continue")}
					<ArrowRight className="size-5" aria-hidden="true" />
				</button>
				<p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
					<Lock className="size-3.5" aria-hidden="true" />
					{t("secure")}
				</p>
			</form>
		</LayoutMotion>
	);
}

function FeeCover({
	gift,
	feeEstimateMinor,
	onChange,
}: {
	gift: ChooseState["gift"];
	feeEstimateMinor: number | null;
	onChange: (coverFee: boolean) => void;
}) {
	const t = useTranslations("donate.flow.choose");
	const locale = useLocale();
	if (!canCoverFee(gift.currency) || feeEstimateMinor === null) return null;
	const fee = formatAmount(
		fromMinorUnits(feeEstimateMinor),
		gift.currency,
		locale,
	);
	const hintKey =
		gift.frequency === "monthly" ? "coverFeeHintMonthly" : "coverFeeHint";
	return (
		<label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-500">
			<input
				type="checkbox"
				checked={gift.coverFee}
				onChange={(event) => onChange(event.target.checked)}
				className="mt-0.5 size-5 shrink-0 accent-primary-500"
			/>
			<span>
				<span className="block text-sm font-medium">
					{t("coverFee", { fee })}
				</span>
				<span className="mt-1 block text-xs text-muted-foreground">
					{t(hintKey)}
				</span>
			</span>
		</label>
	);
}
