import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const TABS = ["pending", "approved", "rejected"];
const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];

// Mirrors admin applications: header + 3-tab bar + filter bar + table.
export default function AdminApplicationsLoading() {
	return (
		<div>
			<SkeletonPageHeader />

			<div className="mb-6 space-y-4">
				<div className="flex flex-wrap gap-2">
					{TABS.map((k) => (
						<SkeletonBlock key={k} className="h-8 w-24 rounded-full" />
					))}
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<SkeletonBlock className="h-10 w-64 rounded-full" />
					<SkeletonBlock className="h-9 w-40 rounded-full" />
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="bg-muted">
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-16" />
							</th>
							<th className="px-4 py-3">
								<SkeletonBlock className="h-3 w-12" />
							</th>
						</tr>
					</thead>
					<tbody>
						{ROWS.map((k) => (
							<tr key={k} className="border-t border-border/60">
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-32" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-48" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-28" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-4 w-20" />
								</td>
								<td className="px-4 py-3">
									<SkeletonBlock className="h-6 w-20 rounded-full" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
