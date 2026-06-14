import { formatInTimeZone } from "date-fns-tz";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getInitialWeekStart } from "../../careers-corner/[slug]/_actions";
import { loadBookingFromToken } from "./_actions";
import { ManageActions } from "./_components/manage-actions";

export default async function ManageBookingPage({
	params,
}: {
	params: Promise<{ locale: string; token: string }>;
}) {
	const { locale, token } = await params;
	setRequestLocale(locale as Locale);

	const result = await loadBookingFromToken(token);
	if (!result.ok) return <ErrorBox reason={result.reason} />;

	const { booking, mentor } = result;

	const initialWeekStart = mentor
		? await getInitialWeekStart(mentor.slug)
		: null;

	if (booking.status === "cancelled") {
		return (
			<main className="mx-auto max-w-md px-4 py-16 text-center">
				<h1 className="text-xl font-semibold text-gray-900">
					This booking is cancelled
				</h1>
				<p className="mt-2 text-sm text-gray-500">
					If you'd like to book again, head back to{" "}
					{mentor ? mentor.name : "the mentor's page"}.
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-xl px-4 py-12">
			<h1 className="text-2xl font-semibold text-gray-900">
				Manage your booking
			</h1>
			<div className="mt-6 rounded-lg border p-4 text-sm bg-white">
				<p>
					<strong>With:</strong> {mentor?.name ?? "—"}
				</p>
				<p>
					<strong>When:</strong>{" "}
					{formatInTimeZone(
						booking.start_at,
						booking.mentee_timezone,
						"EEE, MMM d, yyyy 'at' HH:mm zzz",
					)}
				</p>
				<p>
					<strong>Meet:</strong>{" "}
					<a
						className="underline text-primary-500"
						href={booking.meet_url}
						target="_blank"
						rel="noreferrer"
					>
						{booking.meet_url}
					</a>
				</p>
			</div>
			<div className="mt-6">
				<ManageActions
					token={token}
					mentorSlug={mentor?.slug ?? ""}
					initialWeekStart={initialWeekStart}
				/>
			</div>
		</main>
	);
}

function ErrorBox({ reason }: { reason: string }) {
	return (
		<main className="mx-auto max-w-md px-4 py-16 text-center">
			<h1 className="text-xl font-semibold text-gray-900">
				This booking link isn't valid
			</h1>
			<p className="mt-2 text-sm text-gray-500">Reason: {reason}</p>
		</main>
	);
}
