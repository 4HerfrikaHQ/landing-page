import { MentorSubpageHeader } from "../_components/mentor-subpage-header";
import { loadMentorBookings } from "./_actions";
import { BookingsTabs } from "./_components/bookings-tabs";

export default async function MentorBookingsPage() {
	const result = await loadMentorBookings();

	return (
		<div className="min-h-screen bg-gray-50">
			<MentorSubpageHeader active="bookings" />
			{!result.ok ? (
				<div className="p-8 max-w-3xl mx-auto">
					<p className="text-sm text-gray-500">
						No mentor profile linked to your account.
					</p>
				</div>
			) : (
				<MentorBookingsContent result={result} />
			)}
		</div>
	);
}

function MentorBookingsContent({
	result,
}: {
	result: Extract<Awaited<ReturnType<typeof loadMentorBookings>>, { ok: true }>;
}) {
	return (
		<div className="p-8 max-w-5xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
				<p className="text-sm text-gray-500 mt-1">
					Mentees who have booked a call with you.
				</p>
			</header>
			<BookingsTabs
				upcoming={result.upcoming}
				past={result.past}
				feedbackByBooking={result.feedbackByBooking}
			/>
		</div>
	);
}
