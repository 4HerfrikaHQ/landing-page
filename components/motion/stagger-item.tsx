"use client";

import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";
import { useReveal } from "./use-reveal";

interface StaggerItemProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Render already-visible, with no entrance. For lists that re-render from
	 * user input (filtering, search) — replaying the reveal on every keystroke
	 * is noise, not polish.
	 */
	immediate?: boolean;
	children: React.ReactNode;
}

/**
 * A child of `StaggerContainer`. Reveals itself the same way `FadeIn` does;
 * the cascade comes from `:nth-child` delays applied by the container in CSS,
 * so no JS has to coordinate between siblings.
 */
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
