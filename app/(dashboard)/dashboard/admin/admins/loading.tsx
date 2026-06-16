import { SkeletonBlock, SkeletonRow } from "@/components/dashboard/skeleton";

const ROWS = ["a", "b", "c", "d", "e"];

// Mirrors admin admins: search + table.
export default function AdminAdminsLoading() {
	return (
		<div className="mx-auto max-w-4xl p-6 sm:p-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-28" />
				<SkeletonBlock className="h-4 w-20" />
			</div>

			<div className="mb-6">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
			</div>

			<div className="space-y-2 rounded-2xl border border-border/60 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				{ROWS.map((k) => (
					<SkeletonRow key={k} avatar={false} className="border-0 p-2" />
				))}
			</div>
		</div>
	);
}
