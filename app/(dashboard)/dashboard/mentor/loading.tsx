import {
	SkeletonBlock,
	SkeletonCard,
	SkeletonRow,
} from "@/components/dashboard/skeleton";

const STATS = ["a", "b", "c", "d"];
const SESSIONS = ["a", "b", "c", "d"];

// Mirrors mentor overview (page.tsx): stat grid + "Next sessions" card list.
export default function MentorOverviewLoading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-40" />
				<SkeletonBlock className="h-4 w-64" />
			</div>

			<div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
				{STATS.map((k) => (
					<SkeletonCard key={k} lines={0} />
				))}
			</div>

			<SkeletonBlock className="mb-4 h-6 w-32" />
			<div className="space-y-3">
				{SESSIONS.map((k) => (
					<SkeletonRow key={k} />
				))}
			</div>
		</div>
	);
}
