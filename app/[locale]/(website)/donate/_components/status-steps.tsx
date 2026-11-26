"use client";

import { RollLabel } from "@/components/ui/roll-label";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Dispatch } from "react";
import type { GiveAction } from "../_lib/give-state";
import { type FailureReason, failureReason } from "../_schema";
import { BankTransferHint } from "./bank-transfer-hint";

export function VerifyingStep() {
	const t = useTranslations("donate.flow.verifying");
	return (
		<output className="flex flex-col items-center gap-4 py-10 text-center">
			<LoaderCircle
				className="size-10 animate-spin text-primary-500 motion-reduce:animate-none"
				aria-hidden="true"
			/>
			<h3 className="text-2xl font-bold">{t("title")}</h3>
			<p className="max-w-sm text-[15px] text-muted-foreground">{t("text")}</p>
		</output>
	);
}

const FAILURE_COPY = {
	[failureReason.def.entries.cancelled]: {
		title: "cancelledTitle",
		text: "cancelledText",
	},
	[failureReason.def.entries.error]: {
		title: "errorTitle",
		text: "errorText",
	},
} as const satisfies Record<FailureReason, { title: string; text: string }>;

export function FailedStep({
	reason,
	dispatch,
	onRetry,
}: {
	reason: FailureReason;
	dispatch: Dispatch<GiveAction>;
	onRetry: () => void;
}) {
	const t = useTranslations("donate.flow.failed");
	const copy = FAILURE_COPY[reason];
	return (
		<div role="alert" className="flex flex-col gap-4">
			<span className="w-fit rounded-full bg-surface-pink px-3 py-1.5 text-xs font-medium text-primary-500">
				{t("badge")}
			</span>
			<h3 className="text-2xl font-bold leading-tight">{t(copy.title)}</h3>
			<p className="text-[15px] text-muted-foreground">{t(copy.text)}</p>
			<button
				type="button"
				onClick={onRetry}
				className="press inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-8 text-lg font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500"
			>
				<RollLabel>{t("retry")}</RollLabel>
			</button>
			<button
				type="button"
				onClick={() => dispatch({ type: "went-back" })}
				className="inline-flex h-11 items-center justify-center rounded-full text-[15px] font-medium text-primary-500 underline underline-offset-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-500"
			>
				{t("changeGift")}
			</button>
			<BankTransferHint />
		</div>
	);
}
