import { SkeletonBlock } from "@/components/dashboard/skeleton";

const FIELDS = ["a", "b", "c", "d", "e"];

// Mirrors profile: a single panel with an avatar + form field blocks.
export default function MentorProfileLoading() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 space-y-2">
				<SkeletonBlock className="h-7 w-40" />
				<SkeletonBlock className="h-4 w-80" />
			</div>

			<div className="rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
				<div className="mb-6 flex items-center gap-4">
					<SkeletonBlock className="size-24 shrink-0 rounded-full" />
					<div className="flex-1 space-y-2">
						<SkeletonBlock className="h-4 w-1/3" />
						<SkeletonBlock className="h-3 w-1/2" />
					</div>
				</div>
				<div className="space-y-4">
					{FIELDS.map((k) => (
						<div key={k} className="space-y-2">
							<SkeletonBlock className="h-3 w-24" />
							<SkeletonBlock className="h-10 w-full rounded-lg" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
