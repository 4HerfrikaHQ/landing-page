"use client";

import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { Controller } from "react-hook-form";
import { sendLearnerCode, verifyLearnerCode } from "../_actions";
import { formatCountdown } from "../_helpers";
import { useSecondsUntil } from "../_hooks/use-seconds-until";
import { OTP_LENGTH, VerifyLearnerCodeSchema } from "../_schema";
import { AuthError } from "./auth-error";
import type { SentCode } from "./email-step";

const MS_PER_SECOND = 1000;
const SLOT_INDEXES = Array.from({ length: OTP_LENGTH }, (_, index) => index);
const GROUP_SIZE = OTP_LENGTH / 2;

export function CodeStep({
	sent,
	next,
	onResent,
	onChangeEmail,
}: {
	sent: SentCode;
	next: string;
	onResent: (resendAt: number) => void;
	onChangeEmail: () => void;
}) {
	const t = useTranslations("academyAuth.code");
	const secondsLeft = useSecondsUntil(sent.resendAt);
	const verify = useHookFormAction(
		verifyLearnerCode,
		zodResolver(VerifyLearnerCodeSchema),
		{
			formProps: { values: { email: sent.email, code: "", next } },
			actionProps: { onError: () => verify.form.resetField("code") },
		},
	);
	const resend = useAction(sendLearnerCode, {
		onSuccess: ({ data }) => {
			if (data) onResent(Date.now() + data.retryAfter * MS_PER_SECOND);
		},
	});

	const error =
		verify.form.formState.errors.code?.message ??
		verify.action.result.serverError ??
		resend.result.serverError;
	const verifying = verify.action.isPending || verify.action.hasSucceeded;
	const resendDisabled = resend.isPending || secondsLeft > 0;
	const resendLabel =
		secondsLeft > 0
			? t("resendIn", { time: formatCountdown(secondsLeft) })
			: t("resend");
	const verifyLabel = verifying ? t("verifying") : t("verify");

	return (
		<form
			onSubmit={verify.handleSubmitWithAction}
			className="flex flex-col gap-8"
		>
			<div className="flex flex-col gap-3">
				<div className="flex size-14 items-center justify-center rounded-full bg-surface-pink text-primary-500">
					<Mail className="size-6" aria-hidden="true" />
				</div>
				<h1 className="font-heading text-[32px] leading-[1.1] font-medium tracking-tight text-secondary-500">
					{t("title")}
				</h1>
				<p className="text-base text-muted-foreground">
					{t.rich("sentTo", {
						email: sent.email,
						strong: (chunks) => (
							<span className="break-words font-semibold text-foreground">
								{chunks}
							</span>
						),
					})}
				</p>
			</div>

			<div className="flex flex-col gap-4">
				<Controller
					control={verify.form.control}
					name="code"
					render={({ field }) => (
						<InputOTP
							maxLength={OTP_LENGTH}
							pattern={REGEXP_ONLY_DIGITS}
							autoComplete="one-time-code"
							autoFocus
							value={field.value}
							onChange={field.onChange}
							onComplete={() => verify.handleSubmitWithAction()}
							disabled={verifying}
							aria-label={t("codeLabel")}
							aria-invalid={Boolean(error)}
							containerClassName="justify-start"
						>
							<InputOTPGroup className="gap-2">
								{SLOT_INDEXES.slice(0, GROUP_SIZE).map((index) => (
									<CodeSlot key={index} index={index} />
								))}
							</InputOTPGroup>
							<InputOTPSeparator className="px-2 text-muted-foreground" />
							<InputOTPGroup className="gap-2">
								{SLOT_INDEXES.slice(GROUP_SIZE).map((index) => (
									<CodeSlot key={index} index={index} />
								))}
							</InputOTPGroup>
						</InputOTP>
					)}
				/>
				<p className="text-sm text-muted-foreground" aria-live="polite">
					{t("didntGetIt")}{" "}
					<button
						type="button"
						disabled={resendDisabled}
						onClick={() => {
							verify.resetFormAndAction();
							resend.execute({ email: sent.email, next });
						}}
						className="font-medium text-primary-500 underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
					>
						{resendLabel}
					</button>
				</p>
			</div>

			<AuthError message={error} id="learner-code-error" />

			<div className="flex flex-col gap-3">
				<Button
					type="submit"
					size="lg"
					disabled={verifying}
					className="h-12 w-full py-0 text-base md:py-0 md:text-base"
				>
					{verifyLabel}
				</Button>
				<button
					type="button"
					onClick={onChangeEmail}
					className="text-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
				>
					{t("changeEmail")}
				</button>
			</div>
		</form>
	);
}

function CodeSlot({ index }: { index: number }) {
	return (
		<InputOTPSlot
			index={index}
			className="size-11 rounded-lg border text-xl font-medium first:rounded-lg last:rounded-lg sm:size-12"
		/>
	);
}
