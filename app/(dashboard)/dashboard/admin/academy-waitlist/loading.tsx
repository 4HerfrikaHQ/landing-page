import {
	SkeletonBlock,
	SkeletonPageHeader,
} from "@/components/dashboard/skeleton";

const ROWS = ["a", "b", "c", "d", "e", "f"];

export default function AcademyWaitlistLoading() {
	return (
		<div>
			<SkeletonPageHeader />
			<div className="mb-6 space-y-4">
				<div className="flex flex-wrap gap-2">
					<SkeletonBlock className="h-8 w-28 rounded-full" />
					<SkeletonBlock className="h-8 w-24 rounded-full" />
					<SkeletonBlock className="h-8 w-28 rounded-full" />
					<SkeletonBlock className="h-8 w-24 rounded-full" />
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<SkeletonBlock className="h-10 w-64 rounded-full" />
					<SkeletonBlock className="h-8 w-36 rounded-full" />
				</div>
			</div>
			<div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<table className="w-full min-w-[760px] text-left text-sm">
					<tbody>
						{ROWS.map((row) => (
							<tr key={row} className="border-b border-border/60 last:border-0">
								{[
									"name",
									"academy",
									"email",
									"phone",
									"location",
									"joined",
								].map((cell) => (
									<td key={cell} className="px-4 py-4">
										<SkeletonBlock className="h-4 w-24" />
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
