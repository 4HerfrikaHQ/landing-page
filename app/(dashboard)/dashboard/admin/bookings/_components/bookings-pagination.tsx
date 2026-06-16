"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState } from "nuqs";

export function BookingsPagination({
	page,
	pageSize,
	total,
	shown,
}: {
	page: number;
	pageSize: number;
	total: number;
	/** Number of rows actually rendered on this page. */
	shown: number;
}) {
	const [, setPage] = useQueryState("page");

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const end = (page - 1) * pageSize + shown;

	if (total <= pageSize) return null;

	function goTo(next: number) {
		setPage(next <= 1 ? null : String(next));
	}

	return (
		<div className="mt-4 flex items-center justify-between gap-4">
			<p className="text-sm text-muted-foreground tabular-nums">
				Showing {start}–{end} of {total}
			</p>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => goTo(page - 1)}
					disabled={page <= 1}
					className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-foreground"
				>
					<ChevronLeft className="size-4" />
					Previous
				</button>
				<span className="text-sm text-muted-foreground tabular-nums">
					{page} / {totalPages}
				</span>
				<button
					type="button"
					onClick={() => goTo(page + 1)}
					disabled={page >= totalPages}
					className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-foreground"
				>
					Next
					<ChevronRight className="size-4" />
				</button>
			</div>
		</div>
	);
}
