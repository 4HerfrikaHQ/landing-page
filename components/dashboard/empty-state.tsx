import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	/** Optional CTA, e.g. a Button or Link. */
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-white/50 px-6 py-14 text-center",
				className,
			)}
		>
			<span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface-pink text-primary-500">
				<Icon className="size-6" strokeWidth={1.75} />
			</span>
			<h3 className="font-heading text-base font-medium text-foreground">
				{title}
			</h3>
			{description ? (
				<p className="mt-1 max-w-sm text-sm text-muted-foreground">
					{description}
				</p>
			) : null}
			{action ? <div className="mt-5">{action}</div> : null}
		</div>
	);
}
