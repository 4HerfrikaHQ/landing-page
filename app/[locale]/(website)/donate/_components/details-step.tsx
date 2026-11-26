"use client";

import { formatAmount, fromMinorUnits } from "@/src/lib/paystack/amounts";
import type { ChargeBreakdown } from "@/src/lib/paystack/fee";
import { Lock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Dispatch } from "react";
import type { GiveAction, GiveState } from "../_lib/give-state";
import { NAME_MAX_LENGTH, NOTE_MAX_LENGTH } from "../_schema";

type DetailsStep = Extract<GiveState, { status: "details" | "paying" }>;

const FIELD =
	"h-12 w-full rounded-xl border border-input bg-white px-4 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 aria-invalid:border-destructive";

export function DetailsStep({
	state,
	dispatch,
	charge,
	onPay,
}: {
	state: DetailsStep;
	dispatch: Dispatch<GiveAction>;
	charge: ChargeBreakdown;
	onPay: () => void;
}) {
	const t = useTranslations("donate.flow.details");
	const locale = useLocale();
	const { gift, donor } = state;
	const paying = state.status === "paying";
	const emailInvalid = state.status === "details" && state.emailInvalid;
	const total = formatAmount(
		fromMinorUnits(charge.chargeMinor),
		gift.currency,
		locale,
	);
	const monthly = gift.frequency === "monthly";
	const perMonth = monthly ? t("perMonth") : "";
	const summary = t(monthly ? "summaryMonthly" : "summaryOnce", {
		currency: gift.currency,
	});
	const emailMessage = t(emailInvalid ? "emailError" : "emailHelp");
	const payLabel = paying ? t("paying") : t("pay", { amount: total });
	const payNote = t(paying ? "payingNote" : "payNote");

	return (
		<form
			aria-label={t("formLabel")}
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				onPay();
			}}
			className="flex flex-col gap-5"
		>
			<p className="text-sm font-semibold text-muted-foreground">
				{t("step")} <span className="text-foreground">{t("stepName")}</span>
			</p>

			<div className="flex items-center justify-between gap-3 rounded-xl bg-surface-pink px-4 py-3">
				<div>
					<p className="text-xl font-semibold tabular-nums text-primary-500">
						{total}
						<span className="ml-1 text-sm font-normal text-muted-foreground">
							{perMonth}
						</span>
					</p>
					<p className="text-xs text-muted-foreground">{summary}</p>
				</div>
				<button
					type="button"
					disabled={paying}
					onClick={() => dispatch({ type: "went-back" })}
					className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-primary-500 underline underline-offset-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-50"
				>
					{t("change")}
				</button>
			</div>

			<label className="block">
				<span className="text-sm font-semibold">{t("name")}</span>
				<input
					name="name"
					autoComplete="name"
					value={donor.name}
					disabled={paying}
					maxLength={NAME_MAX_LENGTH}
					onChange={(event) =>
						dispatch({
							type: "donor-changed",
							donor: { name: event.target.value },
						})
					}
					className={`${FIELD} mt-2`}
				/>
			</label>

			<label className="block">
				<span className="text-sm font-semibold">
					{t("email")}{" "}
					<span className="font-normal text-muted-foreground">
						{t("required")}
					</span>
				</span>
				<input
					type="email"
					name="email"
					required
					autoComplete="email"
					value={donor.email}
					disabled={paying}
					aria-invalid={emailInvalid}
					aria-describedby="email-help"
					onChange={(event) =>
						dispatch({
							type: "donor-changed",
							donor: { email: event.target.value },
						})
					}
					className={`${FIELD} mt-2`}
				/>
				<span
					id="email-help"
					role={emailInvalid ? "alert" : undefined}
					data-invalid={emailInvalid}
					className="mt-2 block text-xs text-muted-foreground data-[invalid=true]:font-medium data-[invalid=true]:text-destructive"
				>
					{emailMessage}
				</span>
			</label>

			<label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-500">
				<input
					type="checkbox"
					checked={donor.anonymous}
					disabled={paying}
					onChange={(event) =>
						dispatch({
							type: "donor-changed",
							donor: { anonymous: event.target.checked },
						})
					}
					className="mt-0.5 size-5 shrink-0 accent-primary-500"
				/>
				<span>
					<span className="block text-sm font-medium">{t("anonymous")}</span>
					<span className="mt-1 block text-xs text-muted-foreground">
						{t("anonymousHint")}
					</span>
				</span>
			</label>

			<label className="block">
				<span className="text-sm font-semibold">
					{t("note")}{" "}
					<span className="font-normal text-muted-foreground">
						{t("optional")}
					</span>
				</span>
				<textarea
					name="note"
					rows={3}
					maxLength={NOTE_MAX_LENGTH}
					value={donor.note}
					disabled={paying}
					placeholder={t("notePlaceholder")}
					onChange={(event) =>
						dispatch({
							type: "donor-changed",
							donor: { note: event.target.value },
						})
					}
					className="mt-2 w-full rounded-xl border border-input bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
				/>
				<span className="mt-1 block text-right text-xs text-muted-foreground tabular-nums">
					{t("noteCount", { count: donor.note.length, max: NOTE_MAX_LENGTH })}
				</span>
			</label>

			<button
				type="submit"
				disabled={paying}
				className="press inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-500 px-8 text-lg font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:opacity-60"
			>
				<Lock className="size-5" aria-hidden="true" />
				{payLabel}
			</button>
			<output className="block text-center text-xs text-muted-foreground">
				{payNote}
			</output>
		</form>
	);
}
