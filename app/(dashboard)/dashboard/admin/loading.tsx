import {
	SkeletonBlock,
	SkeletonCard,
	SkeletonRow,
} from "@/components/dashboard/skeleton";

const STATS = ["a", "b", "c", "d"];
const ATTENTION = ["a", "b", "c"];
const LISTS = ["a", "b"];

// Mirrors admin overview (page.tsx): stat grid + chart + attention/activity cards.
export default function AdminOverviewLoading() {
	return (
		<div className="mx-auto max-w-6xl p-6 sm:p-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-40" />
				<SkeletonBlock className="h-4 w-72" />
			</div>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{STATS.map((k) => (
					<SkeletonCard key={k} lines={0} />
				))}
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] lg:col-span-2">
					<SkeletonBlock className="mb-4 h-5 w-40" />
					<SkeletonBlock className="h-56 w-full rounded-2xl" />
				</div>
				<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
					<SkeletonBlock className="mb-4 h-5 w-36" />
					<div className="space-y-3">
						{ATTENTION.map((k) => (
							<SkeletonBlock key={k} className="h-12 w-full rounded-xl" />
						))}
					</div>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
				{LISTS.map((k) => (
					<div
						key={k}
						className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
					>
						<SkeletonBlock className="mb-4 h-5 w-40" />
						<div className="space-y-3">
							{ATTENTION.map((row) => (
								<SkeletonRow
									key={row}
									avatar={false}
									className="border-0 p-0"
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
