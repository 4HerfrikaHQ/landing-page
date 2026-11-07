import type { LucideIcon } from "lucide-react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { AnimatedCounter } from "@/components/motion/animated-counter";
import { cn } from "@/utils/cn";

interface StatCardProps {
	icon: LucideIcon;
	label: string;
	value: number;
	/** Format the (animated) numeric value into display text, e.g. (v) => `${v}%`. */
	formatValue?: (value: number) => string;
	/** When set, renders a "view all →" link to this route. */
	href?: Route | string;
	/** Optional delta indicator shown under the value. */
	delta?: {
		value: number;
		/** Label after the delta, e.g. "vs last month". */
		label?: string;
	};
	/** A shorter, horizontal treatment for dense summary rows. */
	compact?: boolean;
	className?: string;
}

export function StatCard({
	icon: Icon,
	label,
	value,
	formatValue,
	href,
	delta,
	compact = false,
	className,
}: StatCardProps) {
	const isPositive = delta ? delta.value >= 0 : false;

	return (
		<div
			className={cn(
				"flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
				compact && "flex-row items-center gap-3 rounded-xl p-3",
				className,
			)}
		>
			<div className="flex items-start justify-between">
				<span
					className={cn(
						"flex size-10 items-center justify-center rounded-xl bg-surface-pink text-primary-500",
						compact && "size-8 rounded-lg",
					)}
				>
					<Icon className={cn("size-5", compact && "size-4")} strokeWidth={2} />
				</span>
				{href ? (
					<Link
						href={href as Route}
						className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 no-underline transition-colors hover:text-primary-500/80"
					>
						View all
						<ArrowRight className="size-3.5" />
					</Link>
				) : null}
			</div>

			<div className={cn("space-y-1", compact && "min-w-0 space-y-0")}>
				<p
					className={cn(
						"text-3xl font-semibold tabular-nums text-foreground",
						compact && "text-xl leading-tight",
					)}
				>
					{compact ? (
						formatValue ? (
							formatValue(value)
						) : (
							value
						)
					) : formatValue ? (
						<FormattedCounter value={value} format={formatValue} />
					) : (
						<AnimatedCounter target={value} />
					)}
				</p>
				<p
					className={cn(
						"text-sm text-muted-foreground",
						compact && "truncate text-xs",
					)}
				>
					{label}
				</p>
			</div>

			{delta ? (
				<div className="flex items-center gap-1 text-xs font-medium tabular-nums">
					<span
						className={cn(
							"inline-flex items-center gap-1",
							isPositive ? "text-green-600" : "text-destructive",
						)}
					>
						{isPositive ? (
							<TrendingUp className="size-3.5" />
						) : (
							<TrendingDown className="size-3.5" />
						)}
						{isPositive ? "+" : ""}
						{delta.value}
					</span>
					{delta.label ? (
						<span className="text-muted-foreground">{delta.label}</span>
					) : null}
				</div>
			) : null}
		</div>
	);
}

/**
 * Renders the formatted value. AnimatedCounter only emits raw rounded numbers,
 * so when a custom format is needed we show the final formatted value directly
 * (still tabular-nums, still respects layout). The counter animation applies to
 * the unformatted variant which is the common case for plain counts.
 */
function FormattedCounter({
	value,
	format,
}: {
	value: number;
	format: (value: number) => string;
}) {
	return <span>{format(value)}</span>;
}
