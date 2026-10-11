import { EmptyState } from "@/components/dashboard/empty-state";
import { verifyUnsubscribeToken } from "@/src/lib/email-unsubscribe";
import { CheckCircle2, LinkIcon, MailX } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { UnsubscribeButton } from "./_components/unsubscribe-button";

export const metadata: Metadata = {
	title: "Unsubscribe | 4Herfrika",
	robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-md px-4 py-16">{children}</div>
		</main>
	);
}

export default async function UnsubscribePage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		e?: string;
		t?: string;
		done?: string;
		error?: string;
	}>;
}) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);
	const sp = await searchParams;

	if (sp.done) {
		return (
			<Shell>
				<EmptyState
					icon={CheckCircle2}
					title="You've been unsubscribed"
					description="You won't get rebooking reminders from us anymore. Booking confirmations and reminders for calls you schedule still come through."
				/>
			</Shell>
		);
	}

	const { e, t } = sp;
	const valid = e && t ? verifyUnsubscribeToken(e, t) : false;

	if (!valid || !e || !t || sp.error) {
		return (
			<Shell>
				<EmptyState
					icon={LinkIcon}
					title="This link isn't valid"
					description="The unsubscribe link may be incomplete. Try the link in your email again."
				/>
			</Shell>
		);
	}

	return (
		<Shell>
			<EmptyState
				icon={MailX}
				title="Unsubscribe from rebooking reminders?"
				description={`We'll stop sending rebooking reminders to ${e}. You'll still get confirmations and reminders for calls you book.`}
				action={<UnsubscribeButton e={e} t={t} />}
			/>
		</Shell>
	);
}
