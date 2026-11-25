"use client";

import { cn } from "@/utils/cn";
import { m } from "motion/react";
import type { HTMLAttributes } from "react";
import { ITEM_VARIANTS } from "./reveal-variants";

interface StaggerItemProps
	extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
	> {
	immediate?: boolean;
	children: React.ReactNode;
}

export function StaggerItem({
	immediate = false,
	className,
	children,
	...props
}: StaggerItemProps) {
	return (
		<m.div
			data-motion=""
			variants={ITEM_VARIANTS}
			initial={immediate ? false : undefined}
			className={cn(className)}
			{...props}
		>
			{children}
		</m.div>
	);
}
