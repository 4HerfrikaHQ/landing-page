import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	/** Optional right-aligned slot, e.g. a primary action button. */
	action?: ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	subtitle,
	action,
	className,
}: PageHeaderProps) {
	return (
		<header
			className={cn(
				"mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				className,
			)}
		>
			<div className="space-y-1">
				<h1 className="font-heading text-2xl font-semibold text-foreground">
					{title}
				</h1>
				{subtitle ? (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				) : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</header>
	);
}
