import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { and, eq, sql } from "drizzle-orm";
import { MentorSubpageHeader } from "../_components/mentor-subpage-header";

export default async function MentorStatsPage() {
	const user = await currentDbUser();
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.user_id, user.id))
		.limit(1);

	return (
		<div className="min-h-screen bg-gray-50">
			<MentorSubpageHeader active="stats" />
			{!mentor ? (
				<div className="p-8 max-w-3xl mx-auto">
					<p className="text-sm text-gray-500">
						No mentor profile linked to your account.
					</p>
				</div>
			) : (
				<StatsContent mentorId={mentor.id} />
			)}
		</div>
	);
}

async function StatsContent({ mentorId }: { mentorId: string }) {
	const [counts] = await db
		.select({
			total: sql<number>`count(*)::int`,
			completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')::int`,
			noShow: sql<number>`count(*) filter (where ${bookings.status} = 'no_show')::int`,
			cancelled: sql<number>`count(*) filter (where ${bookings.status} = 'cancelled')::int`,
		})
		.from(bookings)
		.where(eq(bookings.mentor_id, mentorId));

	const [rating] = await db
		.select({
			avg: sql<number>`coalesce(avg(${bookingFeedback.rating}), 0)::float`,
		})
		.from(bookingFeedback)
		.innerJoin(bookings, eq(bookings.id, bookingFeedback.booking_id))
		.where(and(eq(bookings.mentor_id, mentorId)));

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">Stats</h1>
				<p className="text-sm text-gray-500 mt-1">
					Your mentorship at a glance.
				</p>
			</header>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<Stat label="Total bookings" value={counts.total} />
				<Stat label="Completed" value={counts.completed} />
				<Stat label="No-shows" value={counts.noShow} />
				<Stat label="Cancelled" value={counts.cancelled} />
				<Stat
					label="Avg rating"
					value={rating.avg ? rating.avg.toFixed(1) : "—"}
				/>
			</div>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-lg border p-4 bg-white">
			<p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
			<p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
		</div>
	);
}
