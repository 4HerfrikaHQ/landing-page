import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const STATUS_PILLS = ["all", "active", "inactive"];
const SORT_PILLS = ["name", "joined", "bookings"];
const FEATURED_PILLS = ["all", "featured", "not-featured"];
const ROWS = ["a", "b", "c", "d", "e", "f"];

// Mirrors admin mentors: header + action, filter bar (search + pill groups), table.
export default function AdminMentorsLoading() {
	return (
		<div>
			<SkeletonPageHeader action />

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
				<div className="flex items-center gap-2">
					{STATUS_PILLS.map((k) => (
						<SkeletonBlock key={`status-${k}`} className="h-9 w-20 rounded-full" />
					))}
				</div>
				<div className="flex items-center gap-2">
					{SORT_PILLS.map((k) => (
						<SkeletonBlock key={`sort-${k}`} className="h-9 w-20 rounded-full" />
					))}
				</div>
				<div className="flex items-center gap-2">
					{FEATURED_PILLS.map((k) => (
						<SkeletonBlock
							key={`featured-${k}`}
							className="h-9 w-24 rounded-full"
						/>
					))}
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="bg-muted">
							<th className="w-10 px-4 py-3" />
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-12" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-14" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-12" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
						</tr>
					</thead>
					<tbody>
						{ROWS.map((k) => (
							<tr key={k} className="border-t border-border/60">
								<td className="w-10 px-4 py-3" />
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<SkeletonBlock className="size-8 shrink-0 rounded-full" />
										<SkeletonBlock className="h-3.5 w-24" />
									</div>
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-3.5 w-28" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-3.5 w-36" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-3.5 w-8" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-3.5 w-20" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-6 w-11 rounded-full" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-3.5 w-16" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
