import type {
	MentorCalendarCallbackOutcome,
	MentorCalendarCallbackReason,
} from "@/app/(dashboard)/dashboard/mentor/profile/_components/mentor-calendar-connection";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { saveOnboardingAvailability } from "@/src/db/actions/availability";
import { mentorLoginUrl } from "@/src/lib/mentor-login-url";
import { CircleAlertIcon, ClockIcon, SparklesIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FourHerfrikaLogo from "../../../4herfrika-logo";
import { loadMentorFromToken } from "./_actions";
import { OnboardingCalendarStep } from "./_components/onboarding-calendar-step";
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

const LINK_PROBLEM = {
	used: { icon: SparklesIcon, key: "linkUsed" },
	expired: { icon: ClockIcon, key: "linkExpired" },
	malformed: { icon: CircleAlertIcon, key: "linkInvalid" },
} as const;

function OnboardShell({ children }: { children: React.ReactNode }) {
	return (
		<main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-surface-pink via-white to-white px-4 py-16">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-surface-pink to-transparent"
			/>
			<div className="relative mx-auto w-full max-w-2xl">{children}</div>
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

	const t = await getTranslations("mentorAuth");

	if (!result.ok) {
		const problem =
			result.reason === "used" || result.reason === "expired"
				? LINK_PROBLEM[result.reason]
				: LINK_PROBLEM.malformed;
		return (
			<OnboardShell>
				<div className="flex flex-col items-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<EmptyState
						className="mt-10 w-full border-solid bg-white"
						icon={problem.icon}
						title={t(`${problem.key}.title`)}
						description={t(`${problem.key}.description`)}
						action={
							<div className="flex flex-wrap items-center justify-center gap-3">
								<Button
									href={mentorLoginUrl({ email: result.email, locale })}
									size="sm"
								>
									{t("signIn")}
								</Button>
								{result.reason !== "used" ? (
									<Button href={SUPPORT_MAILTO} variant="outline" size="sm">
										{t("emailTeam")}
									</Button>
								) : null}
							</div>
						}
					/>
				</div>
			</OnboardShell>
		);
	}

	const { mentor, availability, calendarConnection } = result;
	const callbackOutcome = getCallbackOutcome(callbackParams);
	const saveAvailability = saveOnboardingAvailability.bind(null, token);

	if (mentor.active) {
		return (
			<OnboardShell>
				<FadeIn className="flex flex-col items-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<EmptyState
						className="mt-10 w-full border-solid bg-surface-pink/40"
						icon={SparklesIcon}
						title={t("alreadyLive.title")}
						description={t("alreadyLive.description")}
						action={
							<div className="flex flex-wrap items-center justify-center gap-3">
								<Button href={`/careercorner/${mentor.slug}`} size="sm">
									{t("alreadyLive.viewProfile")}
								</Button>
								<Button
									href={mentorLoginUrl({ email: mentor.email, locale })}
									variant="outline"
									size="sm"
								>
									{t("signIn")}
								</Button>
							</div>
						}
					/>
				</FadeIn>
			</OnboardShell>
		);
	}

	return (
		<OnboardShell>
			<FadeIn>
				<header className="flex flex-col items-center text-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<p className="mt-8 text-xs uppercase tracking-wide text-primary-500">
						Mentor onboarding
					</p>
					<h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground">
						Welcome, {mentor.name}
					</h1>
					<p className="mt-2 max-w-md text-muted-foreground">
						Set your availability, complete your profile, and connect Google
						Calendar before going live. You can edit everything later from your
						dashboard.
					</p>
				</header>

				<div className="mt-10 rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8">
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
