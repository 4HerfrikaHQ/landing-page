import { formatInTimeZone } from "date-fns-tz";
import {
	CalendarClock,
	CalendarDays,
	CheckCircle2,
	ExternalLink,
	Users,
} from "lucide-react";

import { AvatarCircle } from "@/components/dashboard/avatar-circle";
import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer } from "@/components/motion/stagger-container";
import { StaggerItem } from "@/components/motion/stagger-item";
import { Button } from "@/components/ui/button";
import { currentDbUser } from "@/src/auth";

import { getMentorOverview } from "./_actions";

export default async function MentorDashboardPage() {
	const [user, overview] = await Promise.all([
		currentDbUser(),
		getMentorOverview(),
	]);

	if (!overview) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	const firstName = user.name.split(" ")[0];

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<FadeIn>
				<PageHeader
					title={`Hi, ${firstName}`}
					subtitle="Here is how your mentorship is doing."
				/>
			</FadeIn>

			<FadeIn delay={0.05}>
				<div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
					<StatCard
						icon={CalendarClock}
						label="Upcoming this week"
						value={overview.upcomingThisWeek}
					/>
					<StatCard
						icon={Users}
						label="Active mentees"
						value={overview.mentees}
						href="/dashboard/mentor/mentees"
					/>
					<StatCard
						icon={CheckCircle2}
						label="Completed sessions"
						value={overview.completed}
					/>
					<StatCard
						icon={CalendarDays}
						label="Total bookings"
						value={overview.total}
						href="/dashboard/mentor/bookings"
					/>
				</div>
			</FadeIn>

			<FadeIn delay={0.1}>
				<div className="mb-4 flex items-baseline justify-between">
					<h2 className="font-heading text-lg font-semibold text-foreground">
						Next sessions
					</h2>
					{overview.recent.length > 0 ? (
						<Button href="/dashboard/mentor/bookings" variant="link" size="sm">
							View all
						</Button>
					) : null}
				</div>

				{overview.recent.length === 0 ? (
					<EmptyState
						icon={CalendarDays}
						title="No upcoming sessions yet"
						description="Set your weekly availability so mentees can find a time to book a call with you."
						action={
							<Button
								href="/dashboard/mentor/availability"
								variant="solid"
								size="sm"
							>
								Set your availability
							</Button>
						}
					/>
				) : (
					<StaggerContainer className="space-y-3">
						{overview.recent.map((booking) => (
							<StaggerItem key={booking.id}>
								<DataCard>
									<DataCardSection className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex min-w-0 items-center gap-3">
											<AvatarCircle name={booking.menteeName} />
											<div className="min-w-0">
												<p className="truncate font-medium text-foreground">
													{booking.menteeName}
												</p>
												<p className="truncate text-sm text-muted-foreground">
													{booking.menteeEmail}
												</p>
											</div>
										</div>
										<div className="flex flex-wrap items-center gap-3 sm:justify-end">
											<div className="text-sm text-muted-foreground">
												{formatInTimeZone(
													new Date(booking.startAt),
													"UTC",
													"MMM d, yyyy · HH:mm 'UTC'",
												)}
											</div>
											<StatusBadge status={booking.status} />
											<Button
												href={booking.meetUrl}
												isExternal
												variant="outline"
												size="sm"
											>
												<ExternalLink className="size-4" />
												Join Meet
											</Button>
										</div>
									</DataCardSection>
								</DataCard>
							</StaggerItem>
						))}
					</StaggerContainer>
				)}
			</FadeIn>
		</div>
	);
}
