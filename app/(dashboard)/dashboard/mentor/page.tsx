import { currentDbUser } from "@/src/auth";
import { formatInTimeZone } from "date-fns-tz";
import { getMentorOverview } from "./_actions";

export default async function MentorDashboardPage() {
	const [user, overview] = await Promise.all([
		currentDbUser(),
		getMentorOverview(),
	]);

	if (!overview) {
		return (
			<div className="p-8 max-w-3xl mx-auto">
				<p className="text-sm text-gray-500">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	const firstName = user.name.split(" ")[0];

	return (
		<div className="p-8 max-w-5xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">
					Hi, {firstName} 👋
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Here's how your mentorship is doing.
				</p>
			</header>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8">
				<StatCard label="Upcoming (7d)" value={overview.upcomingThisWeek} />
				<StatCard label="Active mentees" value={overview.mentees} />
				<StatCard label="Completed sessions" value={overview.completed} />
				<StatCard label="Total bookings" value={overview.total} />
			</div>

			<section className="rounded-lg border bg-white p-6">
				<div className="flex items-baseline justify-between mb-4">
					<h2 className="text-sm font-semibold text-gray-900">Next sessions</h2>
					<a
						href="/dashboard/mentor/bookings"
						className="text-xs text-gray-400 hover:text-gray-600"
					>
						View all →
					</a>
				</div>

				{overview.recent.length === 0 ? (
					<p className="text-sm text-gray-500">No upcoming sessions yet.</p>
				) : (
					<ul className="divide-y">
						{overview.recent.map((booking) => (
							<li
								key={booking.id}
								className="py-3 flex items-center justify-between text-sm"
							>
								<div>
									<p className="font-medium text-gray-900">
										{booking.menteeName}
									</p>
									<p className="text-xs text-gray-500">{booking.menteeEmail}</p>
								</div>
								<p className="text-xs text-gray-500">
									{formatInTimeZone(
										new Date(booking.startAt),
										"UTC",
										"MMM d, yyyy · HH:mm 'UTC'",
									)}
								</p>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-lg border p-4 bg-white">
			<p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
			<p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
		</div>
	);
}
