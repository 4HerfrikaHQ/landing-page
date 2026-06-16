import { SkeletonBlock, SkeletonRow } from "@/components/dashboard/skeleton";

const PILLS = ["a", "b", "c"];
const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];

// Mirrors admin mentors: filter bar (search + pill groups) + table.
export default function AdminMentorsLoading() {
	return (
		<div className="mx-auto max-w-5xl p-6 sm:p-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-32" />
				<SkeletonBlock className="h-4 w-24" />
			</div>

			<div className="mb-6 flex flex-wrap gap-3">
				<SkeletonBlock className="h-10 w-64 rounded-full" />
				{PILLS.map((k) => (
					<SkeletonBlock key={k} className="h-9 w-32 rounded-full" />
				))}
			</div>

			<div className="space-y-2 rounded-2xl border border-border/60 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				{ROWS.map((k) => (
					<SkeletonRow key={k} />
				))}
			</div>
		</div>
	);
}
