import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const COLUMNS = ["learner", "task", "submitted", "attempt", "status"];
const ROWS = ["a", "b", "c", "d", "e", "f"];

export default function AdminAcademyTasksLoading() {
	return (
		<div>
			<SkeletonPageHeader />

			<div className="mb-6 flex flex-wrap items-center gap-3">
				<SkeletonBlock className="h-9 w-56 rounded-full" />
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full text-left text-sm">
					<thead>
						<tr className="bg-muted">
							{COLUMNS.map((column) => (
								<th key={column} className="px-4 py-3">
									<SkeletonBlock className="h-3 w-16" />
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ROWS.map((row) => (
							<tr key={row} className="border-t border-border/60">
								{COLUMNS.map((column) => (
									<td key={column} className="px-4 py-3">
										<SkeletonBlock className="h-4 w-28" />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
