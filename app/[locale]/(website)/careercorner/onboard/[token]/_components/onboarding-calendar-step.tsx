"use client";

import {
	type MentorCalendarCallbackOutcome,
	MentorCalendarConnection,
	type MentorCalendarConnection as MentorCalendarConnectionView,
} from "@/app/(dashboard)/dashboard/mentor/profile/_components/mentor-calendar-connection";
import { Button } from "@/components/ui/button";
import { mentorLoginUrl } from "@/src/lib/mentor-login-url";
import { useHookFormAction } from "@/src/lib/use-hook-form-action";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	completeMentorOnboarding,
	startOnboardingGoogleCalendar,
} from "../_actions";
import { ActivateOnboardingSchema } from "../_schema";

export function OnboardingCalendarStep({
	token,
	locale,
	connection,
	callbackOutcome,
}: {
	token: string;
	locale: string;
	connection: MentorCalendarConnectionView;
	callbackOutcome?: MentorCalendarCallbackOutcome | null;
}) {
	const router = useRouter();
	const t = useTranslations("mentorAuth.goLive");
	const { form, handleSubmitWithAction, action } = useHookFormAction(
		completeMentorOnboarding,
		zodResolver(ActivateOnboardingSchema),
		{
			formProps: { defaultValues: { token } },
			actionProps: {
				onSuccess: ({ data }) => {
					toast.success(t("title"), {
						description: t("description"),
						duration: 15000,
						action: {
							label: t("action"),
							onClick: () => router.push(mentorLoginUrl({ locale }) as Route),
						},
					});
					if (data?.slug) {
						const localePrefix =
							locale === "fr" || locale === "sw" ? `/${locale}` : "";
						router.push(`${localePrefix}/careercorner/${data.slug}` as Route);
					}
				},
				onError: ({ error }) => {
					toast.error(error.serverError ?? "Could not complete onboarding.");
					router.refresh();
				},
			},
		},
	);

	const isConnected = connection.status === "connected";

	return (
		<div className="space-y-6">
			<MentorCalendarConnection
				connection={connection}
				callbackOutcome={callbackOutcome}
				actions={{
					connect: () => startOnboardingGoogleCalendar(token, locale),
					reconnect: () => startOnboardingGoogleCalendar(token, locale, true),
				}}
			/>
			<form onSubmit={handleSubmitWithAction}>
				<input type="hidden" {...form.register("token")} />
				<Button
					type="submit"
					className="w-full"
					disabled={!isConnected || action.isPending}
				>
					{action.isPending ? "Going live…" : "Go live"}
				</Button>
			</form>
		</div>
	);
}
