import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const STATS = ["total", "upcoming", "completed", "cancelled", "no-show"];
const BODY_ROWS = ["a", "b", "c", "d", "e", "f"];

// Mirrors admin bookings: header + stats + filter bar + table + pagination row.
export default function AdminBookingsLoading() {
	return (
		<div>
			{/* Header */}
			<SkeletonPageHeader />

			<div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
				{STATS.map((stat) => (
					<div
						key={stat}
						className="flex items-center gap-3 rounded-xl border border-border/60 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
					>
						<SkeletonBlock className="size-8 shrink-0 rounded-lg" />
						<div className="space-y-1">
							<SkeletonBlock className="h-5 w-10" />
							<SkeletonBlock className="h-3 w-20" />
						</div>
					</div>
				))}
			</div>

			{/* Filter bar */}
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<SkeletonBlock className="h-10 w-80 rounded-full" />
				<SkeletonBlock className="h-10 w-40 rounded-full" />
				<SkeletonBlock className="h-10 w-56 rounded-full" />
				<SkeletonBlock className="h-10 w-40 rounded-full" />
			</div>

			{/* Table-shaped skeleton */}
			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full text-sm">
					<thead className="bg-muted text-left">
						<tr>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-12" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="ml-auto h-3 w-12" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-14" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-14" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-12" />
							</th>
						</tr>
					</thead>
					<tbody>
						{BODY_ROWS.map((row) => (
							<tr key={row} className="border-t border-border/60">
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-40" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-28" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-48" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-6 w-20 rounded-full" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="ml-auto h-8 w-16 rounded-full" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination row */}
			<div className="mt-6 flex justify-end">
				<SkeletonBlock className="h-9 w-40 rounded-full" />
			</div>
		</div>
	);
}
