import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/motion/fade-in";
import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentorApplications } from "@/src/db/schema/tables/mentor-applications";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { formatInTimeZone } from "date-fns-tz";
import { and, count, desc, eq, gte } from "drizzle-orm";
import {
	AlertTriangle,
	CalendarDays,
	FileText,
	GraduationCap,
	Shield,
	UserCheck,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import { OverviewChart } from "./_components/overview-chart";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AdminDashboardPage() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const now = new Date();
	const since30d = new Date(now.getTime() - 30 * DAY_MS);
	const since7d = new Date(now.getTime() - 7 * DAY_MS);

	const [
		[{ mentorCount }],
		[{ adminCount }],
		[{ pendingApplications }],
		[{ bookingCount }],
		[{ academyWaitlistCount }],
		recentBookings,
		recentApplications,
		recentNoShows,
		bookingsLast30d,
	] = await Promise.all([
		db.select({ mentorCount: count() }).from(schema.mentors),
		db
			.select({ adminCount: count() })
			.from(schema.users)
			.where(eq(schema.users.role, "super_admin")),
		db
			.select({ pendingApplications: count() })
			.from(mentorApplications)
			.where(eq(mentorApplications.status, "pending")),
		db.select({ bookingCount: count() }).from(bookings),
		db
			.select({ academyWaitlistCount: count() })
			.from(schema.academyWaitlistEntries),
		db
			.select({
				id: bookings.id,
				mentee_name: bookings.mentee_name,
				start_at: bookings.start_at,
				status: bookings.status,
				mentee_timezone: bookings.mentee_timezone,
				mentor_name: users.name,
			})
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.innerJoin(users, eq(mentors.user_id, users.id))
			.orderBy(desc(bookings.created_at))
			.limit(6),
		db
			.select({
				id: mentorApplications.id,
				name: mentorApplications.name,
				industry: mentorApplications.industry,
				status: mentorApplications.status,
				created_at: mentorApplications.created_at,
			})
			.from(mentorApplications)
			.orderBy(desc(mentorApplications.created_at))
			.limit(6),
		db
			.select({
				id: bookings.id,
				mentee_name: bookings.mentee_name,
				start_at: bookings.start_at,
				mentee_timezone: bookings.mentee_timezone,
				mentor_name: users.name,
			})
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.innerJoin(users, eq(mentors.user_id, users.id))
			.where(
				and(eq(bookings.status, "no_show"), gte(bookings.start_at, since7d)),
			)
			.orderBy(desc(bookings.start_at))
			.limit(5),
		db
			.select({ created_at: bookings.created_at })
			.from(bookings)
			.where(gte(bookings.created_at, since30d)),
	]);

	// Bucket bookings into a daily series for the chart (last 30 days).
	const buckets = new Map<string, number>();
	for (let i = 29; i >= 0; i--) {
		const d = new Date(now.getTime() - i * DAY_MS);
		buckets.set(d.toISOString().slice(0, 10), 0);
	}
	for (const row of bookingsLast30d) {
		const key = row.created_at.toISOString().slice(0, 10);
		if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
	}
	const chartData = Array.from(buckets.entries()).map(([date, value]) => ({
		date,
		label: formatInTimeZone(new Date(date), "UTC", "MMM d"),
		bookings: value,
	}));

	const firstName = user.name.split(" ")[0];

	return (
		<div>
			<PageHeader
				title={`Hi, ${firstName}`}
				subtitle="Here is a quick overview of the platform."
			/>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					icon={Users}
					label="Mentors"
					value={mentorCount}
					href={"/dashboard/admin/mentors" as Route}
				/>
				<StatCard
					icon={CalendarDays}
					label="Bookings"
					value={bookingCount}
					href={"/dashboard/admin/bookings" as Route}
				/>
				<StatCard
					icon={FileText}
					label="Pending applications"
					value={pendingApplications}
					href={"/dashboard/admin/applications?status=pending" as Route}
				/>
				<StatCard
					icon={Shield}
					label="Admins"
					value={adminCount}
					href={"/dashboard/admin/admins" as Route}
				/>
				<StatCard
					icon={GraduationCap}
					label="Academy waitlist"
					value={academyWaitlistCount}
					href={"/dashboard/admin/academy-waitlist" as Route}
				/>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<FadeIn className="lg:col-span-2">
					<DataCard>
						<DataCardSection>
							<div className="mb-4 flex items-center justify-between">
								<div>
									<h2 className="font-heading text-base font-semibold text-foreground">
										Bookings over time
									</h2>
									<p className="text-sm text-muted-foreground">
										New bookings created in the last 30 days
									</p>
								</div>
							</div>
							<OverviewChart data={chartData} />
						</DataCardSection>
					</DataCard>
				</FadeIn>

				<FadeIn delay={0.1}>
					<DataCard className="h-full">
						<DataCardSection>
							<div className="mb-4 flex items-center gap-2">
								<span className="flex size-8 items-center justify-center rounded-lg bg-surface-pink text-primary-500">
									<AlertTriangle className="size-4" strokeWidth={2} />
								</span>
								<h2 className="font-heading text-base font-semibold text-foreground">
									Needs attention
								</h2>
							</div>

							<Link
								href={"/dashboard/admin/applications?status=pending" as Route}
								className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 no-underline transition-colors hover:border-primary-500"
							>
								<span className="text-sm text-foreground">
									Pending applications
								</span>
								<span className="text-lg font-semibold tabular-nums text-primary-500">
									{pendingApplications}
								</span>
							</Link>

							<div className="mt-4">
								<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									No-shows this week
								</p>
								{recentNoShows.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No no-shows in the last 7 days.
									</p>
								) : (
									<ul className="space-y-2">
										{recentNoShows.map((b) => (
											<li
												key={b.id}
												className="flex items-center justify-between gap-2 text-sm"
											>
												<span className="min-w-0 truncate text-foreground">
													{b.mentee_name}
													<span className="text-muted-foreground">
														{" · "}
														{b.mentor_name}
													</span>
												</span>
												<span className="shrink-0 text-xs text-muted-foreground">
													{formatInTimeZone(
														b.start_at,
														b.mentee_timezone,
														"MMM d",
													)}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
						</DataCardSection>
					</DataCard>
				</FadeIn>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<FadeIn>
					<DataCard className="h-full">
						<DataCardSection>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="font-heading text-base font-semibold text-foreground">
									Recent bookings
								</h2>
								<Link
									href={"/dashboard/admin/bookings" as Route}
									className="text-xs font-medium text-primary-500 no-underline transition-colors hover:text-primary-500/80"
								>
									View all
								</Link>
							</div>
							{recentBookings.length === 0 ? (
								<EmptyState
									icon={CalendarDays}
									title="No bookings yet"
									description="Bookings will appear here as mentees book sessions."
								/>
							) : (
								<ul className="divide-y divide-border/60">
									{recentBookings.map((b) => (
										<li
											key={b.id}
											className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
										>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium text-foreground">
													{b.mentee_name}
												</p>
												<p className="truncate text-xs text-muted-foreground">
													{b.mentor_name}
													{" · "}
													{formatInTimeZone(
														b.start_at,
														b.mentee_timezone,
														"MMM d, HH:mm",
													)}
												</p>
											</div>
											<StatusBadge status={b.status} />
										</li>
									))}
								</ul>
							)}
						</DataCardSection>
					</DataCard>
				</FadeIn>

				<FadeIn delay={0.1}>
					<DataCard className="h-full">
						<DataCardSection>
							<div className="mb-4 flex items-center justify-between">
								<h2 className="font-heading text-base font-semibold text-foreground">
									Recent applications
								</h2>
								<Link
									href={"/dashboard/admin/applications" as Route}
									className="text-xs font-medium text-primary-500 no-underline transition-colors hover:text-primary-500/80"
								>
									View all
								</Link>
							</div>
							{recentApplications.length === 0 ? (
								<EmptyState
									icon={UserCheck}
									title="No applications yet"
									description="New mentor applications will show up here."
								/>
							) : (
								<ul className="divide-y divide-border/60">
									{recentApplications.map((a) => (
										<li
											key={a.id}
											className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
										>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium text-foreground">
													{a.name}
												</p>
												<p className="truncate text-xs capitalize text-muted-foreground">
													{a.industry ?? "—"}
													{" · "}
													{formatInTimeZone(a.created_at, "UTC", "MMM d, yyyy")}
												</p>
											</div>
											<StatusBadge status={a.status} />
										</li>
									))}
								</ul>
							)}
						</DataCardSection>
					</DataCard>
				</FadeIn>
			</div>
		</div>
	);
}
