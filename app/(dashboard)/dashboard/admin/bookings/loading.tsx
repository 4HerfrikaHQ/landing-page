import { SkeletonBlock, SkeletonRow } from "@/components/dashboard/skeleton";

const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];

// Mirrors admin bookings: filter bar + table + pagination row.
export default function AdminBookingsLoading() {
	return (
		<div className="mx-auto max-w-6xl p-6 sm:p-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-40" />
				<SkeletonBlock className="h-4 w-64" />
			</div>

			<div className="mb-6 flex flex-wrap gap-3">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
				<SkeletonBlock className="h-9 w-40 rounded-full" />
				<SkeletonBlock className="h-9 w-40 rounded-full" />
			</div>

			<div className="space-y-2 rounded-2xl border border-border/60 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				{ROWS.map((k) => (
					<SkeletonRow key={k} avatar={false} className="border-0 p-2" />
				))}
			</div>

			<div className="mt-6 flex justify-end">
				<SkeletonBlock className="h-9 w-40 rounded-full" />
			</div>
		</div>
	);
}
