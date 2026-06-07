import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { loadFeedbackContext } from "./_actions";
import { FeedbackForm } from "./_components/feedback-form";

export default async function FeedbackPage({
	params,
}: {
	params: Promise<{ locale: string; token: string }>;
}) {
	const { locale, token } = await params;
	setRequestLocale(locale as Locale);

	const result = await loadFeedbackContext(token);

	if (!result.ok) {
		if (result.reason === "already_submitted") {
			return (
				<main className="mx-auto max-w-md px-4 py-16 text-center">
					<h1 className="text-xl font-semibold text-gray-900">
						Thanks — we already have your feedback.
					</h1>
				</main>
			);
		}
		return (
			<main className="mx-auto max-w-md px-4 py-16 text-center">
				<h1 className="text-xl font-semibold text-gray-900">
					This link isn't valid
				</h1>
				<p className="mt-2 text-sm text-gray-500">Reason: {result.reason}</p>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-lg px-4 py-12">
			<h1 className="text-2xl font-semibold text-gray-900">
				How was your call with {result.mentor?.name ?? "your mentor"}?
			</h1>
			<p className="mt-2 text-sm text-gray-500">
				Your feedback helps us match mentors better and improve the program.
			</p>
			<div className="mt-8">
				<FeedbackForm token={token} />
			</div>
		</main>
	);
}
