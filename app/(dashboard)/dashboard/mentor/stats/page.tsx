import { CalendarDays, CheckCircle2, Star, UserX, XCircle } from "lucide-react";

import { DashboardFilter, FilterBar } from "@/components/dashboard/filter-bar";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { FadeIn } from "@/components/motion/fade-in";
import { loadMentorStats } from "./_actions";
import { StatsCharts } from "./_components/stats-charts";
import { StatsRange } from "./_schema";

const RANGE_OPTIONS = [
	{ value: "30d", label: "30 days" },
	{ value: "90d", label: "90 days" },
	{ value: "all", label: "All time" },
];

export default async function MentorStatsPage({
	searchParams,
}: {
	searchParams: Promise<{ range?: string }>;
}) {
	const sp = await searchParams;
	const range = StatsRange.catch("90d").parse(sp.range);
	const result = await loadMentorStats(range);

	if (!result.ok) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">
					No mentor profile linked to your account.
				</p>
			</div>
		);
	}

	const { counts, avgRating, series } = result;

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<FadeIn>
				<PageHeader title="Stats" subtitle="Your mentorship at a glance." />
			</FadeIn>

			<FadeIn delay={0.05}>
				<FilterBar className="mb-6">
					<DashboardFilter
						label="Range"
						paramKey="range"
						options={RANGE_OPTIONS}
						includeAll={false}
						defaultValue="90d"
					/>
				</FilterBar>
			</FadeIn>

			<FadeIn delay={0.1}>
				<div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
					<StatCard
						icon={CalendarDays}
						label="Total bookings"
						value={counts.total}
					/>
					<StatCard
						icon={CheckCircle2}
						label="Completed"
						value={counts.completed}
					/>
					<StatCard icon={UserX} label="No-shows" value={counts.noShow} />
					<StatCard icon={XCircle} label="Cancelled" value={counts.cancelled} />
					<StatCard
						icon={Star}
						label="Avg rating"
						value={Math.round(avgRating * 10)}
						formatValue={() => (avgRating ? avgRating.toFixed(1) : "—")}
					/>
				</div>
			</FadeIn>

			<FadeIn delay={0.15}>
				<StatsCharts series={series} counts={counts} />
			</FadeIn>
		</div>
	);
}
