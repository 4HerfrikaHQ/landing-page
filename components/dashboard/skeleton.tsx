import { cn } from "@/utils/cn";

function SkeletonBlock({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]",
				className,
			)}
		/>
	);
}

/**
 * Skeleton that matches `PageHeader`'s box exactly (same wrapper, margins, and
 * text line-heights) so swapping loading → loaded causes no vertical shift.
 */
export function SkeletonPageHeader({ action = false }: { action?: boolean }) {
	return (
		<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div className="space-y-1">
				{/* h1 text-2xl → ~2rem line height */}
				<SkeletonBlock className="h-8 w-48" />
				{/* subtitle text-sm → ~1.25rem line height */}
				<SkeletonBlock className="h-5 w-64" />
			</div>
			{action ? <SkeletonBlock className="h-10 w-32 rounded-full" /> : null}
		</div>
	);
}

interface SkeletonCardProps {
	className?: string;
	/** Number of body text lines to render. Default 2. */
	lines?: number;
}

/** Shape-matched skeleton for a `DataCard` / `StatCard`. */
export function SkeletonCard({ className, lines = 2 }: SkeletonCardProps) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
				className,
			)}
		>
			<div className="flex items-center gap-3">
				<SkeletonBlock className="size-10 shrink-0 rounded-xl" />
				<div className="flex-1 space-y-2">
					<SkeletonBlock className="h-4 w-1/3" />
					<SkeletonBlock className="h-3 w-1/2" />
				</div>
			</div>
			{lines > 0 ? (
				<div className="mt-4 space-y-2">
					{Array.from({ length: lines }).map((_, i) => (
						<SkeletonBlock
							key={`line-${i + 1}`}
							className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

interface SkeletonRowProps {
	className?: string;
	/** Whether to show a leading avatar circle. Default true. */
	avatar?: boolean;
}

/** Shape-matched skeleton for a list/table row. */
export function SkeletonRow({ className, avatar = true }: SkeletonRowProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-xl border border-border/60 bg-white p-4",
				className,
			)}
		>
			{avatar ? (
				<SkeletonBlock className="size-9 shrink-0 rounded-full" />
			) : null}
			<div className="flex-1 space-y-2">
				<SkeletonBlock className="h-3.5 w-1/3" />
				<SkeletonBlock className="h-3 w-1/2" />
			</div>
			<SkeletonBlock className="h-6 w-16 rounded-full" />
		</div>
	);
}

export { SkeletonBlock };
