import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

/**
 * Marks a group whose `StaggerItem` children should cascade rather than land
 * together. The cascade is `:nth-child` animation delays in `globals.css`, so
 * this component ships no JS at all — it is a plain server component.
 */
export function StaggerContainer({
	className,
	children,
	...props
}: StaggerContainerProps) {
	return (
		<div data-stagger className={cn(className)} {...props}>
			{children}
		</div>
	);
}
