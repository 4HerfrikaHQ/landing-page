import { SkeletonBlock, SkeletonCard } from "@/components/dashboard/skeleton";

const TABS = ["a", "b"];
const CARDS = ["a", "b", "c", "d"];

// Mirrors mentor bookings: tab bar + filter bar + booking cards.
export default function MentorBookingsLoading() {
	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-32" />
				<SkeletonBlock className="h-4 w-72" />
			</div>

			<div className="mb-6 flex gap-2">
				{TABS.map((k) => (
					<SkeletonBlock key={k} className="h-8 w-24 rounded-full" />
				))}
			</div>

			<div className="mb-6 flex flex-wrap gap-3">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
				<SkeletonBlock className="h-9 w-40 rounded-full" />
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
