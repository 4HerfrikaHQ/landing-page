import { redirect } from "@/i18n/navigation";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { FailedView } from "./_components/failed-view";
import { PendingView } from "./_components/pending-view";
import { SuccessView } from "./_components/success-view";
import { type GiveOutcome, resolveOutcome } from "./_lib/outcome";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "donate.thanks" });
	return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

const REFERENCE_MAX_LENGTH = 100;

function firstValue(value: string | string[] | undefined): string | undefined {
	return Array.isArray(value) ? value[0] : value;
}

function OutcomeView({ outcome }: { outcome: GiveOutcome }) {
	switch (outcome.status) {
		case "success":
			return <SuccessView gift={outcome.gift} />;
		case "pending":
			return <PendingView reference={outcome.reference} />;
		case "failed":
			return <FailedView reference={outcome.reference} />;
	}
}

export default async function ThankYouPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const locale = await setLocaleFromParams(params);
	const query = await searchParams;
	const reference = firstValue(query.reference) ?? firstValue(query.trxref);
	if (!reference) return redirect({ href: "/donate", locale });

	const outcome = await resolveOutcome(
		reference.slice(0, REFERENCE_MAX_LENGTH),
	);

	return (
		<main className="min-h-[70vh] overflow-x-clip bg-[#fffaf5] px-4 pb-16 pt-12 text-foreground lg:px-20 lg:pb-24 lg:pt-20">
			<OutcomeView outcome={outcome} />
		</main>
	);
}
