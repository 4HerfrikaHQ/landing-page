import { JOIN_US_URL } from "@/app/[locale]/(website)/navigation";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle2, LinkIcon } from "lucide-react";
import type { Route } from "next";
import type { Locale } from "next-intl";
import {
	getFormatter,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
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
	const t = await getTranslations("feedback");
	const format = await getFormatter();

	const result = await loadFeedbackContext(token);

	if (!result.ok) {
		if (result.reason === "already_submitted") {
			return (
				<Shell>
					<EmptyState
						icon={CheckCircle2}
						title={t("alreadyTitle")}
						description={t("alreadyDescription")}
						action={
							<div className="flex flex-col gap-3 sm:flex-row">
								<Button href={"/careercorner" as Route}>
									{t("browseMentors")}
								</Button>
								<Button href={JOIN_US_URL} isExternal variant="outline">
									{t("joinCommunity")}
								</Button>
							</div>
						}
					/>
				</Shell>
			);
		}
		return (
			<Shell>
				<EmptyState
					icon={LinkIcon}
					title={t("invalidTitle")}
					description={t("invalidDescription")}
				/>
			</Shell>
		);
	}

	const mentorName = result.mentor?.name ?? t("fallbackMentor");
	const whenLabel = format.dateTime(result.booking.start_at, {
		dateStyle: "medium",
		timeZone: result.booking.mentee_timezone,
	});

	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
				<h1 className="text-2xl font-semibold text-foreground">
					{t("heading", { name: mentorName })}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">{t("subheading")}</p>

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
					<FeedbackForm
						token={token}
						mentorName={mentorName}
						mentorSlug={result.mentor.slug}
					/>
				</div>
			</div>
		</main>
	);
}
