import { EmptyState } from "@/components/dashboard/empty-state";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarClock, CheckCircle2, LinkIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { loadFeedbackContext } from "./_actions";
import { FeedbackForm } from "./_components/feedback-form";

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-md px-4 py-16">{children}</div>
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
	const t = await getTranslations({ locale, namespace: "seo.sessionFeedback" });
	return {
		title: t("title"),
		description: t("description"),
		robots: { index: false, follow: false },
	};
}

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
				<Shell>
					<EmptyState
						icon={CheckCircle2}
						title="We already have your feedback"
						description="Thanks for sharing. It helps us match mentors better and improve the program."
					/>
				</Shell>
			);
		}
		return (
			<Shell>
				<EmptyState
					icon={LinkIcon}
					title="This link isn't valid"
					description="The link may have expired or already been used."
				/>
			</Shell>
		);
	}

	const mentorName = result.mentor?.name ?? "your mentor";
	const whenLabel = formatInTimeZone(
		result.booking.start_at,
		result.booking.mentee_timezone,
		"EEE, MMM d, yyyy",
	);

	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
				<h1 className="text-2xl font-semibold text-foreground">
					How was your call with {mentorName}?
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Your feedback helps us match mentors better and improve the program.
				</p>

				<div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-white px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-pink text-primary-500">
						<CalendarClock className="size-5" />
					</span>
					<div className="text-sm">
						<p className="font-semibold text-foreground">{mentorName}</p>
						<p className="text-muted-foreground">{whenLabel}</p>
					</div>
				</div>

				<div className="mt-8">
					<FeedbackForm token={token} />
				</div>
			</div>
		</main>
	);
}
