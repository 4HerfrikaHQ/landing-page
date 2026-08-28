import { AvailabilityEditor } from "@/components/availability-editor";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { CircleAlertIcon, SparklesIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FourHerfrikaLogo from "../../../4herfrika-logo";
import { loadMentorFromToken } from "./_actions";
import { OnboardingForm } from "./_components/onboarding-form";
import { OnboardingStepper } from "./_components/onboarding-stepper";

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
}: {
	params: Promise<{ locale: string; token: string }>;
}) {
	const { locale, token } = await params;
	setRequestLocale(locale as Locale);

	const result = await loadMentorFromToken(token);

	if (!result.ok) {
		return (
			<OnboardShell>
				<div className="flex flex-col items-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<EmptyState
						className="mt-10 w-full border-solid bg-white"
						icon={CircleAlertIcon}
						title="This link can't be used"
						description={`We couldn't open your onboarding (${result.reason}). Reach out to the 4HerFrika team and we'll send you a fresh link.`}
						action={
							<Button href="/careers-corner" variant="outline" size="sm">
								Back to mentors
							</Button>
						}
					/>
				</div>
			</OnboardShell>
		);
	}

	const { mentor, availability } = result;

	if (mentor.active) {
		return (
			<OnboardShell>
				<FadeIn className="flex flex-col items-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<EmptyState
						className="mt-10 w-full border-solid bg-surface-pink/40"
						icon={SparklesIcon}
						title="Your profile is already live"
						description="You're all set. Mentees can find you in the directory and book a call. You can update your bio, photo, and availability anytime from your dashboard."
						action={
							<div className="flex flex-wrap items-center justify-center gap-3">
								<Button href={`/careers-corner/${mentor.slug}`} size="sm">
									View public profile
								</Button>
								<Button href="/dashboard/mentor" variant="outline" size="sm">
									Go to dashboard
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
						Set your availability and profile in two quick steps. You can edit
						everything later from your dashboard.
					</p>
				</header>

				<div className="mt-10 rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8">
					<OnboardingStepper
						availabilitySlot={
							<AvailabilityEditor
								mentorId={mentor.id}
								initialSlots={availability}
								onboardingToken={token}
							/>
						}
						profileSlot={
							<OnboardingForm
								token={token}
								defaultBio={mentor.bio ?? ""}
								defaultNickname={mentor.nickname ?? ""}
								defaultImage={mentor.image ?? ""}
							/>
						}
					/>
				</div>
			</FadeIn>
		</OnboardShell>
	);
}
