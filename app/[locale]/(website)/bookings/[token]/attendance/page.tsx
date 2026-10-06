import { EmptyState } from "@/components/dashboard/empty-state";
import { formatInTimeZone } from "date-fns-tz";
import { CheckCircle2, LinkIcon } from "lucide-react";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { loadAttendanceContext } from "./_actions";
import { AttendanceForm } from "./_components/attendance-form";

export const metadata = {
	title: "Confirm attendance",
	robots: { index: false, follow: false },
};

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

	const result = await loadAttendanceContext(token);

	if (!result.ok) {
		return (
			<Shell>
				{result.reason === "used" ? (
					<EmptyState
						icon={CheckCircle2}
						title="Already recorded"
						description="Thanks, we already have your answer for this session."
					/>
				) : (
					<EmptyState
						icon={LinkIcon}
						title="This link isn't valid"
						description="The link may have expired or already been used."
					/>
				)}
			</Shell>
		);
	}

	const { booking } = result;
	const whenLabel = formatInTimeZone(
		booking.start_at,
		booking.mentee_timezone,
		"EEE, MMM d, yyyy",
	);

	return (
		<Shell>
			<h1 className="text-2xl font-semibold text-foreground">
				Did {booking.mentee_name} join your call?
			</h1>
			<p className="mt-2 mb-8 text-sm text-muted-foreground">
				Your session on {whenLabel}. This keeps session records accurate.
			</p>
			<AttendanceForm token={token} />
		</Shell>
	);
}
