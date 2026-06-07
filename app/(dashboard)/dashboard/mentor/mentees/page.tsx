import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { formatInTimeZone } from "date-fns-tz";
import { desc, eq, sql } from "drizzle-orm";

export default async function MenteesPage() {
	const user = await currentDbUser();
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.user_id, user.id))
		.limit(1);

	if (!mentor) {
		return (
			<div className="p-8 max-w-3xl mx-auto">
				<p className="text-sm text-gray-500">
					No mentor profile linked to your account.
				</p>
			</div>
		);
	}

	return <MenteesContent mentorId={mentor.id} />;
}

async function MenteesContent({ mentorId }: { mentorId: string }) {
	const mentees = await db
		.select({
			email: bookings.mentee_email,
			name: sql<string>`max(${bookings.mentee_name})`,
			total: sql<number>`count(*)::int`,
			lastAt: sql<Date>`max(${bookings.start_at})`,
		})
		.from(bookings)
		.where(eq(bookings.mentor_id, mentorId))
		.groupBy(bookings.mentee_email)
		.orderBy(desc(sql`max(${bookings.start_at})`));

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">Mentees</h1>
				<p className="text-sm text-gray-500 mt-1">
					Everyone who has booked a call with you.
				</p>
			</header>

			<div className="space-y-3">
				{mentees.length === 0 && (
					<p className="text-sm text-gray-500">No mentees yet.</p>
				)}
				{mentees.map((mentee) => (
					<article
						key={mentee.email}
						className="rounded-lg border p-4 text-sm bg-white"
					>
						<p className="font-medium text-gray-900">
							{mentee.name}{" "}
							<a
								href={`mailto:${mentee.email}`}
								className="font-normal text-gray-500 underline"
							>
								{mentee.email}
							</a>
						</p>
						<p className="text-gray-500">
							{mentee.total} session{mentee.total === 1 ? "" : "s"} · last:{" "}
							{formatInTimeZone(new Date(mentee.lastAt), "UTC", "MMM d, yyyy")}
						</p>
					</article>
				))}
			</div>
		</div>
	);
}
