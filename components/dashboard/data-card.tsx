import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { HoverCard } from "@/components/motion/hover-card";
import { cn } from "@/utils/cn";

const BASE_CARD =
	"rounded-2xl bg-white border border-border/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)]";
const CLICKABLE_CARD =
	"transition hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)]";

interface DataCardProps {
	children: ReactNode;
	className?: string;
	href?: Route | string;
	onClick?: () => void;
	interactive?: boolean;
}

export function DataCard({
	children,
	className,
	href,
	onClick,
	interactive,
}: DataCardProps) {
	if (href) {
		return (
			<Link
				href={href as Route}
				className={cn(
					BASE_CARD,
					CLICKABLE_CARD,
					"block no-underline",
					className,
				)}
			>
				{children}
			</Link>
		);
	}

	if (onClick || interactive) {
		return (
			<HoverCard
				role={onClick ? "button" : undefined}
				tabIndex={onClick ? 0 : undefined}
				onClick={onClick}
				className={cn(BASE_CARD, onClick && "cursor-pointer", className)}
			>
				{children}
			</HoverCard>
		);
	}

	return <div className={cn(BASE_CARD, className)}>{children}</div>;
}

/** Convenience for nesting card-shaped sections; not exported as default. */
export function DataCardSection(props: ComponentProps<"div">) {
	const { className, ...rest } = props;
	return <div className={cn("p-5", className)} {...rest} />;
}
