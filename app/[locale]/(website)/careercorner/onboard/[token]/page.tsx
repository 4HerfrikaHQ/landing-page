import type {
	MentorCalendarCallbackOutcome,
	MentorCalendarCallbackReason,
} from "@/app/(dashboard)/dashboard/mentor/profile/_components/mentor-calendar-connection";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { saveOnboardingAvailability } from "@/src/db/actions/availability";
import { mentorLoginUrl } from "@/src/lib/mentor-login-url";
import { CircleAlertIcon, ClockIcon, SparklesIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { loadMentorFromToken } from "./_actions";
import { OnboardingCalendarStep } from "./_components/onboarding-calendar-step";
import { OnboardingNotice } from "./_components/onboarding-notice";
import { OnboardingStepper } from "./_components/onboarding-stepper";

const ALLOWED_CALLBACK_REASONS: readonly MentorCalendarCallbackReason[] = [
	"oauth_denied",
	"google_account_conflict",
	"expired_state",
	"invalid_state",
	"insufficient_scope",
	"invalid_grant",
	"oauth_exchange_failed",
	"identity_lookup_failed",
	"refresh_token_missing",
	"connection_unavailable",
];

function firstSearchParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function getCallbackOutcome(
	params: Record<string, string | string[] | undefined> | undefined,
): MentorCalendarCallbackOutcome | null {
	if (!params || firstSearchParam(params.googleCalendar) !== "error") {
		return null;
	}

	const reason = firstSearchParam(params.reason);
	return {
		reason: ALLOWED_CALLBACK_REASONS.includes(
			reason as MentorCalendarCallbackReason,
		)
			? (reason as MentorCalendarCallbackReason)
			: "connection_unavailable",
	};
}

const SUPPORT_MAILTO =
	"mailto:4herfrika@gmail.com?subject=My%20mentor%20onboarding%20link";

const PRIMARY_ACTION =
	"h-12 px-6 py-0 text-base font-semibold focus-visible:ring-3 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 md:py-0 md:text-base";

const SECONDARY_ACTION =
	"h-12 px-6 py-0 text-base focus-visible:ring-3 focus-visible:ring-primary-500/30 md:py-0 md:text-base";

const LINK_PROBLEM = {
	used: { icon: SparklesIcon, key: "linkUsed" },
	expired: { icon: ClockIcon, key: "linkExpired" },
	malformed: { icon: CircleAlertIcon, key: "linkInvalid" },
} as const;

function OnboardShell({ children }: { children: React.ReactNode }) {
	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<div className="mx-auto max-w-3xl px-4 pt-6 pb-16 lg:pt-12 lg:pb-24">
				{children}
			</div>
		</main>
	);
}

// Token-gated private page — keep it out of search results, but still give it
// a proper localized title/OG for the browser tab and link previews.
export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({
		locale,
		namespace: "seo.mentorOnboarding",
	});
	return {
		title: t("title"),
		description: t("description"),
		robots: { index: false, follow: false },
	};
}

export default async function OnboardingPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string; token: string }>;
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { locale, token } = await params;
	setRequestLocale(locale as Locale);

	const [result, callbackParams] = await Promise.all([
		loadMentorFromToken(token),
		searchParams,
	]);

	const [t, tOnboarding] = await Promise.all([
		getTranslations("mentorAuth"),
		getTranslations("onboarding"),
	]);

	if (!result.ok) {
		const problem =
			result.reason === "used" || result.reason === "expired"
				? LINK_PROBLEM[result.reason]
				: LINK_PROBLEM.malformed;
		return (
			<OnboardShell>
				<OnboardingNotice
					tone="neutral"
					icon={problem.icon}
					title={t(`${problem.key}.title`)}
					description={t(`${problem.key}.description`)}
					actions={
						<>
							<Button
								href={mentorLoginUrl({ email: result.email, locale })}
								size="lg"
								className={PRIMARY_ACTION}
							>
								{t("signIn")}
							</Button>
							{result.reason !== "used" ? (
								<Button
									href={SUPPORT_MAILTO}
									variant="outline"
									size="lg"
									className={SECONDARY_ACTION}
								>
									{t("emailTeam")}
								</Button>
							) : null}
						</>
					}
				/>
			</OnboardShell>
		);
	}

	const { mentor, availability, calendarConnection } = result;
	const callbackOutcome = getCallbackOutcome(callbackParams);
	const saveAvailability = saveOnboardingAvailability.bind(null, token);

	if (mentor.active) {
		return (
			<OnboardShell>
				<OnboardingNotice
					tone="success"
					icon={SparklesIcon}
					title={t("alreadyLive.title")}
					description={t("alreadyLive.description")}
					actions={
						<>
							<Button
								href={`/careercorner/${mentor.slug}`}
								size="lg"
								className={PRIMARY_ACTION}
							>
								{t("alreadyLive.viewProfile")}
							</Button>
							<Button
								href={mentorLoginUrl({ email: mentor.email, locale })}
								variant="outline"
								size="lg"
								className={SECONDARY_ACTION}
							>
								{t("signIn")}
							</Button>
						</>
					}
				/>
			</OnboardShell>
		);
	}

	return (
		<OnboardShell>
			<FadeIn>
				<header>
					<span className="inline-block rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{tOnboarding("eyebrow")}
					</span>
					<h1 className="mt-4 text-[32px] font-bold leading-tight text-secondary-500 lg:text-5xl">
						{tOnboarding("welcomeFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{mentor.name}
						</em>
					</h1>
					<p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground lg:text-lg">
						{tOnboarding("intro")}
					</p>
				</header>

				<div className="mt-8 rounded-[20px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] sm:p-8 lg:mt-10">
					<OnboardingStepper
						availability={{
							mentorId: mentor.id,
							initialSlots: availability,
							saveAvailabilityAction: saveAvailability,
						}}
						profile={{
							token,
							defaultBio: mentor.bio ?? "",
							defaultDisplayName: mentor.nickname ?? "",
							defaultImage: mentor.image ?? "",
						}}
						calendarSlot={
							<OnboardingCalendarStep
								token={token}
								locale={locale}
								connection={calendarConnection}
								callbackOutcome={callbackOutcome}
							/>
						}
						calendarConnected={calendarConnection.status === "connected"}
						availabilityComplete={availability.length > 0}
						profileComplete={Boolean(mentor.bio)}
					/>
				</div>
			</FadeIn>
		</OnboardShell>
	);
}
