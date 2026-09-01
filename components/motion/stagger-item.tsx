"use client";

import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";
import { useReveal } from "./use-reveal";

interface StaggerItemProps extends HTMLAttributes<HTMLDivElement> {
	immediate?: boolean;
	children: React.ReactNode;
}

export function StaggerItem({
	immediate = false,
	className,
	children,
	...props
}: StaggerItemProps) {
	const { ref, revealed } = useReveal<HTMLDivElement>();

	return (
		<div
			ref={ref}
			data-reveal={immediate ? undefined : "up"}
			data-revealed={revealed || undefined}
			className={cn(className)}
			{...props}
		>
			{children}
		</div>
	);
}
