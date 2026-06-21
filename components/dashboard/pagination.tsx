"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";

/**
 * URL-driven pager. Writes the `page` param with `shallow: false` so the server
 * query refetches. Renders nothing when everything fits on one page.
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

	return (
		<div
			className={`mt-6 flex items-center justify-between ${className ?? ""}`.trim()}
		>
			<p className="text-sm text-muted-foreground">
				Page {page} of {lastPage} · {total} total
			</p>
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={page <= 1}
					onClick={() => setPage(page <= 2 ? null : String(page - 1))}
				>
					<ChevronLeft className="size-4" />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={page >= lastPage}
					onClick={() => setPage(String(page + 1))}
				>
					Next
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
