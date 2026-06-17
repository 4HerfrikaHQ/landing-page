import {
	SkeletonBlock,
	SkeletonCard,
	SkeletonPageHeader,
	SkeletonRow,
} from "@/components/dashboard/skeleton";

const STATS = ["mentors", "bookings", "applications", "admins"];
const NOSHOWS = ["a", "b", "c"];
const LIST_CARDS = ["bookings", "applications"];
const LIST_ROWS = ["a", "b", "c", "d"];

// Mirrors admin overview (page.tsx): header + stat grid + chart/attention row +
// two activity list cards.
export default function AdminOverviewLoading() {
	return (
		<div>
			{/* PageHeader (title + subtitle, no action) */}
			<SkeletonPageHeader />

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{STATS.map((k) => (
					<SkeletonCard key={k} lines={0} />
				))}
			</div>

			{/* Chart (2 cols) + Needs attention card */}
			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] lg:col-span-2">
					<div className="mb-4 space-y-2">
						<SkeletonBlock className="h-5 w-40" />
						<SkeletonBlock className="h-3.5 w-64" />
					</div>
					<SkeletonBlock className="h-56 w-full rounded-2xl" />
				</div>

				<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<div className="mb-4 flex items-center gap-2">
						<SkeletonBlock className="size-8 shrink-0 rounded-lg" />
						<SkeletonBlock className="h-5 w-36" />
					</div>
					<SkeletonBlock className="h-12 w-full rounded-xl" />
					<div className="mt-4 space-y-2">
						<SkeletonBlock className="mb-2 h-3 w-32" />
						{NOSHOWS.map((k) => (
							<SkeletonBlock key={k} className="h-4 w-full" />
						))}
					</div>
				</div>
			</div>

			{/* Recent bookings + Recent applications */}
			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
				{LIST_CARDS.map((card) => (
					<div
						key={card}
						className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
					>
						<div className="mb-4 flex items-center justify-between">
							<SkeletonBlock className="h-5 w-40" />
							<SkeletonBlock className="h-3.5 w-14" />
						</div>
						<div className="space-y-3">
							{LIST_ROWS.map((row) => (
								<SkeletonRow
									key={row}
									avatar={false}
									className="border-0 p-0"
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
