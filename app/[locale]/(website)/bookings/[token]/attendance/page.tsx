import { EmptyState } from "@/components/dashboard/empty-state";
import { CheckCircle2, LinkIcon } from "lucide-react";
import type { Locale } from "next-intl";
import {
	getFormatter,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import { loadAttendanceContext } from "./_actions";
import { AttendanceForm } from "./_components/attendance-form";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.attendance" });
	return {
		title: t("title"),
		description: t("description"),
		robots: { index: false, follow: false },
	};
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<main className="bg-muted">
			<div className="mx-auto max-w-md px-4 py-16">{children}</div>
		</main>
	);
}

export default async function AttendancePage({
	params,
}: {
	params: Promise<{ locale: string; token: string }>;
}) {
	const { locale, token } = await params;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("attendance");
	const format = await getFormatter();

	const result = await loadAttendanceContext(token);

	if (!result.ok) {
		return (
			<Shell>
				{result.reason === "used" ? (
					<EmptyState
						icon={CheckCircle2}
						title={t("usedTitle")}
						description={t("usedDescription")}
					/>
				) : (
					<EmptyState
						icon={LinkIcon}
						title={t("invalidTitle")}
						description={t("invalidDescription")}
					/>
				)}
			</Shell>
		);
	}

	const { booking } = result;
	const date = format.dateTime(booking.start_at, {
		dateStyle: "full",
		timeZone: booking.mentee_timezone,
	});

	return (
		<Shell>
			<h1 className="text-2xl font-semibold text-foreground">
				{t("heading", { name: booking.mentee_name })}
			</h1>
			<p className="mt-2 mb-8 text-sm text-muted-foreground">
				{t("subheading", { date })}
			</p>
			<AttendanceForm token={token} />
		</Shell>
	);
}
