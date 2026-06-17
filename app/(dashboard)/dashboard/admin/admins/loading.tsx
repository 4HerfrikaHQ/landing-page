import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const ROWS = ["a", "b", "c", "d", "e", "f"];

// Mirrors admin admins page: header + search pill + 3-column table.
export default function AdminAdminsLoading() {
	return (
		<div>
			<SkeletonPageHeader action />

			<div className="mb-6">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
			</div>

			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<div className="flex items-center gap-4 border-border/60 border-b bg-muted px-4 py-3">
					<SkeletonBlock className="h-3.5 w-20" />
					<SkeletonBlock className="h-3.5 w-24" />
					<SkeletonBlock className="ml-auto h-3.5 w-16" />
				</div>

				{ROWS.map((k) => (
					<div
						key={k}
						className="flex items-center gap-4 border-border/60 border-b px-4 py-3 last:border-b-0"
					>
						<SkeletonBlock className="h-4 w-32" />
						<SkeletonBlock className="h-4 w-44" />
						<SkeletonBlock className="ml-auto h-4 w-20" />
					</div>
				))}
			</div>
		</div>
	);
}
