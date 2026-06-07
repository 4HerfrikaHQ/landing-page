import { AvailabilityEditor } from "@/components/availability-editor";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { loadMentorFromToken } from "./_actions";
import { OnboardingForm } from "./_components/onboarding-form";

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
			<main className="mx-auto max-w-md px-4 py-16 text-center">
				<h1 className="text-xl font-semibold text-gray-900">
					This link can't be used
				</h1>
				<p className="mt-2 text-sm text-gray-500">
					Reason: {result.reason}. Reach out to the 4HerFrika team to get a new
					link.
				</p>
			</main>
		);
	}

	const { mentor, availability } = result;

	return (
		<main className="mx-auto max-w-2xl px-4 py-12">
			<header>
				<p className="text-xs uppercase tracking-wide text-gray-500">
					Mentor onboarding
				</p>
				<h1 className="mt-1 text-3xl font-semibold text-gray-900">
					Welcome, {mentor.name}
				</h1>
				<p className="mt-2 text-gray-600">
					Set your bio, photo, and weekly availability. You can edit these
					anytime from your dashboard later.
				</p>
			</header>

			{mentor.active && (
				<div className="mt-6 rounded-md border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">
					Your profile is already live. Edits below will publish immediately.
				</div>
			)}

			<section className="mt-10">
				<h2 className="text-lg font-semibold text-gray-900">
					1. Weekly availability
				</h2>
				<p className="mt-1 text-sm text-gray-500">
					Add at least one slot. Save before completing your profile.
				</p>
				<div className="mt-4">
					<AvailabilityEditor
						mentorId={mentor.id}
						initialSlots={availability}
					/>
				</div>
			</section>

			<section className="mt-12">
				<h2 className="text-lg font-semibold text-gray-900">2. Your profile</h2>
				<p className="mt-1 text-sm text-gray-500">
					This is what mentees see on your booking page.
				</p>
				<div className="mt-4">
					<OnboardingForm
						token={token}
						defaultBio={mentor.bio ?? ""}
						defaultNickname={mentor.nickname ?? ""}
						defaultImage={mentor.image ?? ""}
					/>
				</div>
			</section>
		</main>
	);
}
