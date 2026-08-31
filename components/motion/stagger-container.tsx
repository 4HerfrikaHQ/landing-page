import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

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
