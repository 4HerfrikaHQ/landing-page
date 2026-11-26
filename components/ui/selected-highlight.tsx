"use client";

import { EASE_IN_OUT } from "@/components/motion/tokens";
import { cn } from "@/utils/cn";
import { m } from "motion/react";

export function SelectedHighlight({
	layoutId,
	radius,
	className,
}: {
	layoutId: string;
	radius: number;
	className?: string;
}) {
	return (
		<m.span
			aria-hidden="true"
			layoutId={layoutId}
			transition={{ duration: 0.25, ease: EASE_IN_OUT }}
			style={{ borderRadius: radius }}
			className={cn("absolute -inset-px -z-10", className)}
		/>
	);
}
