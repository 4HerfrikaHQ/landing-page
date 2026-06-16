import { SkeletonBlock, SkeletonCard } from "@/components/dashboard/skeleton";

const TABS = ["a", "b", "c"];
const CARDS = ["a", "b", "c", "d"];

// Mirrors admin applications: 3-tab bar + filter bar + application cards.
export default function AdminApplicationsLoading() {
	return (
		<div className="mx-auto max-w-5xl p-6 sm:p-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-56" />
				<SkeletonBlock className="h-4 w-64" />
			</div>

			<div className="mb-6 flex gap-2">
				{TABS.map((k) => (
					<SkeletonBlock key={k} className="h-8 w-24 rounded-full" />
				))}
			</div>

			<div className="mb-6 flex flex-wrap gap-3">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
				<SkeletonBlock className="h-9 w-40 rounded-full" />
			</div>

			<div className="space-y-3">
				{CARDS.map((k) => (
					<SkeletonCard key={k} />
				))}
			</div>
		</div>
	);
}
