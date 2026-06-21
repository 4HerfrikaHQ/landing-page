"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { cn } from "@/utils/cn";

/** Windowed page list with ellipses, e.g. 1 … 4 [5] 6 … 20. */
function pageItems(current: number, last: number): (number | "ellipsis")[] {
	if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
	const items: (number | "ellipsis")[] = [1];
	const start = Math.max(2, current - 1);
	const end = Math.min(last - 1, current + 1);
	if (start > 2) items.push("ellipsis");
	for (let p = start; p <= end; p++) items.push(p);
	if (end < last - 1) items.push("ellipsis");
	items.push(last);
	return items;
}

/**
 * URL-driven pager. Writes the `page` param with `shallow: false` so the server
 * query refetches. Shows a result range, numbered pages (jump to any page), and
 * prev/next arrows. Renders nothing when everything fits on one page.
 */
export function Pagination({
	page,
	pageSize,
	total,
	className,
}: {
	page: number;
	pageSize: number;
	total: number;
	className?: string;
}) {
	const [, setPage] = useQueryState(
		"page",
		parseAsString.withOptions({ shallow: false }),
	);

	const lastPage = Math.max(1, Math.ceil(total / pageSize));
	if (lastPage <= 1) return null;

	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, total);

	// page 1 clears the param to keep the URL clean.
	const goTo = (p: number) => setPage(p <= 1 ? null : String(p));

	const arrowClass =
		"inline-flex size-9 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:border-primary-500 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-foreground";

	return (
		<div
			className={cn(
				"mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row",
				className,
			)}
		>
			<p className="text-sm text-muted-foreground tabular-nums">
				Showing <span className="font-medium text-foreground">{start}</span>–
				<span className="font-medium text-foreground">{end}</span> of{" "}
				<span className="font-medium text-foreground">{total}</span>
			</p>

			<div className="flex items-center gap-1.5">
				<button
					type="button"
					aria-label="Previous page"
					onClick={() => goTo(page - 1)}
					disabled={page <= 1}
					className={arrowClass}
				>
					<ChevronLeft className="size-4" />
				</button>

				{pageItems(page, lastPage).map((item, i) =>
					item === "ellipsis" ? (
						<span
							key={`ellipsis-${i === 1 ? "start" : "end"}`}
							className="px-1 text-sm text-muted-foreground"
						>
							…
						</span>
					) : (
						<button
							key={item}
							type="button"
							aria-label={`Go to page ${item}`}
							aria-current={item === page ? "page" : undefined}
							onClick={() => goTo(item)}
							className={cn(
								"inline-flex size-9 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors",
								item === page
									? "bg-primary-500 text-white shadow-[0_4px_14px_rgba(236,0,140,0.25)]"
									: "border border-border/60 text-foreground hover:border-primary-500 hover:text-primary-500",
							)}
						>
							{item}
						</button>
					),
				)}

				<button
					type="button"
					aria-label="Next page"
					onClick={() => goTo(page + 1)}
					disabled={page >= lastPage}
					className={arrowClass}
				>
					<ChevronRight className="size-4" />
				</button>
			</div>
		</div>
	);
}
