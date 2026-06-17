import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const STATUS_PILLS = ["all", "confirmed", "cancelled", "completed", "no-show"];
const BODY_ROWS = ["a", "b", "c", "d", "e", "f"];

// Mirrors admin bookings: header + filter bar + table + pagination row.
export default function AdminBookingsLoading() {
	return (
		<div>
			{/* Header */}
			<SkeletonPageHeader />

			{/* Filter bar */}
			<div className="mb-6 flex flex-wrap items-center gap-3">
				{/* Search input pill */}
				<SkeletonBlock className="h-10 w-64 rounded-full" />

				{/* Status filter pills (All / Confirmed / Cancelled / Completed / No show) */}
				<div className="flex flex-wrap items-center gap-2">
					{STATUS_PILLS.map((pill) => (
						<SkeletonBlock
							key={pill}
							className="h-8 w-20 rounded-full"
						/>
					))}
				</div>

				{/* Mentor select pill */}
				<SkeletonBlock className="h-10 w-56 rounded-full" />

				{/* Date-range row (two date inputs with a dash) */}
				<div className="flex items-center gap-2">
					<SkeletonBlock className="h-10 w-36 rounded-full" />
					<span className="text-muted-foreground">–</span>
					<SkeletonBlock className="h-10 w-36 rounded-full" />
				</div>
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
