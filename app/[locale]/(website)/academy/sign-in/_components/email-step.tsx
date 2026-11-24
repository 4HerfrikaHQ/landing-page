"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { sendLearnerCode } from "../_actions";
import { SendLearnerCodeSchema } from "../_schema";
import { AuthError } from "./auth-error";
import { GoogleButton } from "./google-button";

const MS_PER_SECOND = 1000;

export type SentCode = { email: string; resendAt: number };

export function EmailStep({
	next,
	callbackFailed,
	onSent,
}: {
	next: string;
	callbackFailed: boolean;
	onSent: (sent: SentCode) => void;
}) {
	const t = useTranslations("academyAuth.signIn");
	const send = useHookFormAction(
		sendLearnerCode,
		zodResolver(SendLearnerCodeSchema),
		{
			formProps: { defaultValues: { email: "", next } },
			actionProps: {
				onSuccess: ({ data }) => {
					if (!data) return;
					onSent({
						email: data.email,
						resendAt: Date.now() + data.retryAfter * MS_PER_SECOND,
					});
				},
			},
		},
	);
	const callbackError = callbackFailed ? "callback_failed" : undefined;
	const error =
		send.form.formState.errors.email?.message ??
		send.action.result.serverError ??
		callbackError;
	const label = send.action.isPending ? t("sending") : t("sendCode");

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-3">
				<span className="w-fit rounded-full bg-surface-pink px-3 py-1 text-xs font-semibold text-primary-700">
					{t("badge")}
				</span>
				<h1 className="font-heading text-[32px] leading-[1.1] font-medium tracking-tight text-secondary-500">
					{t.rich("title", {
						accent: (chunks) => (
							<em className="font-(family-name:--font-playfair) font-black text-primary-500">
								{chunks}
							</em>
						),
					})}
				</h1>
				<p className="text-base text-muted-foreground">{t("subtitle")}</p>
			</div>

			<form
				onSubmit={send.handleSubmitWithAction}
				className="flex flex-col gap-4"
			>
				<GoogleButton next={next} />
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span className="h-px flex-1 bg-border" />
					{t("divider")}
					<span className="h-px flex-1 bg-border" />
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="learner-email"
						className="text-sm font-medium text-foreground"
					>
						{t("emailLabel")}
					</label>
					<Input
						id="learner-email"
						type="email"
						autoComplete="email"
						inputMode="email"
						placeholder={t("emailPlaceholder")}
						aria-invalid={Boolean(error)}
						aria-describedby="learner-email-hint learner-email-error"
						className="h-12 px-4 text-base md:text-base"
						{...send.form.register("email")}
					/>
					<p id="learner-email-hint" className="text-sm text-muted-foreground">
						{t("emailHint")}
					</p>
				</div>

				<AuthError message={error} id="learner-email-error" />

				<Button
					type="submit"
					size="lg"
					disabled={send.action.isPending}
					className="mt-4 h-12 w-full py-0 text-base md:py-0 md:text-base"
				>
					{label}
				</Button>
				<p className="text-center text-xs text-muted-foreground">
					{t.rich("legal", {
						link: (chunks) => (
							<Link href="/privacy" className="underline">
								{chunks}
							</Link>
						),
					})}
				</p>
			</form>
		</div>
	);
}
