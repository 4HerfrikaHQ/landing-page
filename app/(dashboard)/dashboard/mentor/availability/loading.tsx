import { SkeletonBlock, SkeletonCard } from "@/components/dashboard/skeleton";

const DAYS = ["a", "b", "c", "d"];

// Mirrors availability: a stack of per-day editor cards.
export default function MentorAvailabilityLoading() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-40" />
				<SkeletonBlock className="h-4 w-80" />
			</div>

			<div className="space-y-3">
				{DAYS.map((k) => (
					<SkeletonCard key={k} />
				))}
			</div>
		</div>
	);
}
