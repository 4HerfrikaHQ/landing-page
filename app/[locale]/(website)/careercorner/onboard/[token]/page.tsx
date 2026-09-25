import type {
	MentorCalendarCallbackOutcome,
	MentorCalendarCallbackReason,
} from "@/app/(dashboard)/dashboard/mentor/profile/_components/mentor-calendar-connection";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { saveOnboardingAvailability } from "@/src/db/actions/availability";
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

function loginUrl(email: string | null) {
	return email
		? `/dashboard/login?email=${encodeURIComponent(email)}`
		: "/dashboard/login";
}

const LINK_PROBLEM_COPY: Record<
	string,
	{ icon: typeof CircleAlertIcon; title: string; description: string }
> = {
	used: {
		icon: SparklesIcon,
		title: "You've already set up your profile",
		description:
			"This setup link only works once. To update your profile, availability, or see your bookings, sign in with your email. We'll send you a 6-digit code — no password needed.",
	},
	expired: {
		icon: ClockIcon,
		title: "This setup link has expired",
		description:
			"Setup links last 30 days. If you already finished setting up, just sign in. If not, email us and we'll send you a new link.",
	},
	malformed: {
		icon: CircleAlertIcon,
		title: "This link isn't working",
		description:
			"Try opening it straight from your invite email. If you already finished setting up, just sign in instead.",
	},
};

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

	if (!result.ok) {
		const loginHref = loginUrl(result.email);
		const copy =
			LINK_PROBLEM_COPY[result.reason] ?? LINK_PROBLEM_COPY.malformed;
		return (
			<OnboardShell>
				<div className="flex flex-col items-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<EmptyState
						className="mt-10 w-full border-solid bg-white"
						icon={copy.icon}
						title={copy.title}
						description={copy.description}
						action={
							<div className="flex flex-wrap items-center justify-center gap-3">
								<Button href={loginHref} size="sm">
									Sign in to your dashboard
								</Button>
								{result.reason !== "used" ? (
									<Button href={SUPPORT_MAILTO} variant="outline" size="sm">
										Email the 4HerFrika team
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
						title="Your profile is already live"
						description="You're all set. Mentees can find you in the directory and book a call. To update your bio, photo, or availability, sign in with your email at 4herfrika.org/dashboard/login."
						action={
							<div className="flex flex-wrap items-center justify-center gap-3">
								<Button href={`/careercorner/${mentor.slug}`} size="sm">
									View public profile
								</Button>
								<Button
									href={loginUrl(mentor.email)}
									variant="outline"
									size="sm"
								>
									Sign in to your dashboard
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
