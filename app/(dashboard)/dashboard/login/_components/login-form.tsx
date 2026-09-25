"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { sendLoginCode, verifyLoginCode } from "../_actions";
import { SendLoginCodeSchema, VerifyLoginCodeSchema } from "../_schema";

export function LoginForm({ defaultEmail }: { defaultEmail: string }) {
	const t = useTranslations("mentorAuth.login");
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [cooldown]);

	const send = useHookFormAction(
		sendLoginCode,
		zodResolver(SendLoginCodeSchema),
		{
			formProps: { defaultValues: { email: defaultEmail } },
			actionProps: {
				onSuccess: ({ data }) => setCooldown(data?.retryAfter ?? 0),
			},
		},
	);
	const sentTo = send.action.result.data?.email;

	const resend = useAction(sendLoginCode, {
		onSuccess: ({ data }) => setCooldown(data?.retryAfter ?? 0),
	});
	const lastSend = resend.result.data ?? send.action.result.data;

	const verify = useHookFormAction(
		verifyLoginCode,
		zodResolver(VerifyLoginCodeSchema),
		{
			formProps: { values: { email: sentTo ?? "", code: "" } },
			actionProps: { onError: () => verify.form.resetField("code") },
		},
	);

	if (!sentTo) {
		const error =
			send.form.formState.errors.email?.message ??
			send.action.result.serverError;
		return (
			<form onSubmit={send.handleSubmitWithAction} className="space-y-6">
				<div className="space-y-2">
					<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
						{t("title")}
					</h1>
					<p className="text-base text-muted-foreground">{t("subtitle")}</p>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="email"
						className="text-sm font-medium text-foreground"
					>
						{t("emailLabel")}
					</label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						inputMode="email"
						autoFocus
						placeholder={t("emailPlaceholder")}
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? "login-error" : undefined}
						className="h-12 px-4 text-base md:text-base"
						{...send.form.register("email")}
					/>
				</div>

				<ErrorMessage message={error} />

				<Button
					type="submit"
					size="lg"
					disabled={send.action.isPending}
					className="h-12 w-full text-base md:text-base"
				>
					{send.action.isPending ? t("sending") : t("sendCode")}
				</Button>
			</form>
		);
	}

	const error =
		verify.form.formState.errors.code?.message ??
		verify.action.result.serverError ??
		resend.result.serverError;
	const verifying = verify.action.isPending || verify.action.hasSucceeded;

	return (
		<form onSubmit={verify.handleSubmitWithAction} className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
					{t("checkEmail")}
				</h1>
				<p className="text-base text-muted-foreground">
					{t.rich("sentTo", {
						email: sentTo,
						strong: (chunks) => (
							<span className="break-all font-medium text-foreground">
								{chunks}
							</span>
						),
					})}
				</p>
			</div>

			<div className="flex flex-col items-center gap-3">
				<Controller
					control={verify.form.control}
					name="code"
					render={({ field }) => (
						<InputOTP
							maxLength={6}
							pattern={REGEXP_ONLY_DIGITS}
							autoComplete="one-time-code"
							autoFocus
							value={field.value}
							onChange={field.onChange}
							onComplete={() => verify.handleSubmitWithAction()}
							disabled={verifying}
							aria-label={t("codeLabel")}
							aria-invalid={error ? true : undefined}
							containerClassName="justify-center"
						>
							<InputOTPGroup className="gap-2">
								{Array.from({ length: 6 }, (_, i) => (
									<InputOTPSlot
										// biome-ignore lint/suspicious/noArrayIndexKey: fixed slots
										key={i}
										index={i}
										className="size-11 rounded-lg border text-xl font-medium first:rounded-lg last:rounded-lg sm:size-12"
									/>
								))}
							</InputOTPGroup>
						</InputOTP>
					)}
				/>
				<p className="text-sm text-muted-foreground" aria-live="polite">
					{verifying
						? t("verifying")
						: lastSend?.alreadySent
							? t("alreadySent")
							: resend.hasSucceeded
								? t("resent")
								: t("hint")}
				</p>
			</div>

			<ErrorMessage message={error} />

			<div className="rounded-xl bg-surface-pink/50 px-4 py-3 text-sm text-muted-foreground">
				<p className="font-medium text-foreground">{t("missingTitle")}</p>
				<p className="mt-1">{t("missingBody")}</p>
			</div>

			<div className="flex flex-col items-center gap-3 text-sm">
				<button
					type="button"
					onClick={() => {
						verify.resetFormAndAction();
						resend.execute({ email: sentTo });
					}}
					disabled={resend.isPending || cooldown > 0}
					className="font-medium text-primary-500 underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
				>
					{cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resend")}
				</button>
				<button
					type="button"
					onClick={() => {
						send.action.reset();
						resend.reset();
						verify.resetFormAndAction();
					}}
					className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
				>
					{t("changeEmail")}
				</button>
			</div>
		</form>
	);
}

function ErrorMessage({ message }: { message?: string }) {
	const t = useTranslations("mentorAuth.errors");
	if (!message) return null;
	const key = message as Parameters<typeof t>[0];
	return (
		<p
			id="login-error"
			role="alert"
			className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
		>
			{t.has(key) ? t(key) : t("generic")}
		</p>
	);
}
