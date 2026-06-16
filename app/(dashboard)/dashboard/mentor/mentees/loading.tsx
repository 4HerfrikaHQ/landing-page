import { SkeletonBlock, SkeletonCard } from "@/components/dashboard/skeleton";

const CARDS = ["a", "b", "c", "d", "e", "f"];

// Mirrors mentees: filter bar (search + sort pills) + 3-col card grid.
export default function MenteesLoading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-32" />
				<SkeletonBlock className="h-4 w-72" />
			</div>

			<div className="mb-6 flex flex-wrap gap-3">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
				<SkeletonBlock className="h-9 w-40 rounded-full" />
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{CARDS.map((k) => (
					<SkeletonCard key={k} />
				))}
			</div>
		</div>
	);
}
