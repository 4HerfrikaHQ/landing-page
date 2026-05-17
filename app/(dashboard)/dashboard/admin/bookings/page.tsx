import { desc, eq } from "drizzle-orm";
import { unauthorized } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";

export default async function AdminBookingsPage() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const rows = await db
		.select({
			id: bookings.id,
			mentee_name: bookings.mentee_name,
			mentee_email: bookings.mentee_email,
			start_at: bookings.start_at,
			status: bookings.status,
			mentee_timezone: bookings.mentee_timezone,
			mentor_name: mentors.name,
			mentor_slug: mentors.slug,
		})
		.from(bookings)
		.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
		.orderBy(desc(bookings.start_at))
		.limit(200);

	return (
		<div className="p-8 max-w-6xl mx-auto">
			<header className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">All bookings</h1>
				<p className="text-sm text-gray-500 mt-1">
					Most recent 200 bookings across all mentors.
				</p>
			</header>

			<div className="rounded-lg border bg-white overflow-hidden">
				<table className="w-full text-sm">
					<thead className="text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">
						<tr>
							<th className="px-4 py-2">When</th>
							<th className="px-4 py-2">Mentor</th>
							<th className="px-4 py-2">Mentee</th>
							<th className="px-4 py-2">Status</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r.id} className="border-t">
								<td className="px-4 py-2 whitespace-nowrap">
									{formatInTimeZone(
										r.start_at,
										r.mentee_timezone,
										"MMM d, HH:mm",
									)}
								</td>
								<td className="px-4 py-2">{r.mentor_name}</td>
								<td className="px-4 py-2">
									{r.mentee_name}{" "}
									<span className="text-xs text-gray-500">
										{r.mentee_email}
									</span>
								</td>
								<td className="px-4 py-2">
									<StatusBadge status={r.status} />
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} className="px-4 py-6 text-center text-gray-500">
									No bookings yet.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		confirmed: "bg-blue-50 text-blue-700 border-blue-200",
		completed: "bg-green-50 text-green-700 border-green-200",
		cancelled: "bg-gray-100 text-gray-600 border-gray-200",
		no_show: "bg-red-50 text-red-700 border-red-200",
	};
	return (
		<span
			className={`text-xs uppercase tracking-wide px-2 py-0.5 rounded border ${styles[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
		>
			{status}
		</span>
	);
}
