import { SkeletonBlock, SkeletonCard } from "@/components/dashboard/skeleton";

const RANGES = ["a", "b"];
const STATS = ["a", "b", "c", "d", "e"];
const CHARTS = ["a", "b"];

// Mirrors stats: range pills + 5-up stat grid + two chart placeholders.
export default function MentorStatsLoading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-24" />
				<SkeletonBlock className="h-4 w-56" />
			</div>

			<div className="mb-6 flex gap-3">
				{RANGES.map((k) => (
					<SkeletonBlock key={k} className="h-9 w-20 rounded-full" />
				))}
			</div>

			<div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
				{STATS.map((k) => (
					<SkeletonCard key={k} lines={0} />
				))}
			</div>

			<div className="space-y-6">
				{CHARTS.map((k) => (
					<SkeletonBlock key={k} className="h-64 w-full rounded-2xl" />
				))}
			</div>
		</div>
	);
}
