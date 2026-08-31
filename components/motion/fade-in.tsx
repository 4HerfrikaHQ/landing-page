"use client";

import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";
import { useReveal } from "./use-reveal";

export type RevealDirection = "up" | "down" | "left" | "right" | "scale";

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
	direction?: RevealDirection;
	delay?: number;
	children: React.ReactNode;
}

export function FadeIn({
	direction = "up",
	delay = 0,
	className,
	children,
	...props
}: FadeInProps) {
	const { ref, revealed } = useReveal<HTMLDivElement>();

	return (
		<div
			ref={ref}
			data-reveal={direction}
			data-revealed={revealed || undefined}
			style={delay ? { animationDelay: `${delay}s` } : undefined}
			className={cn(className)}
			{...props}
		>
			{children}
		</div>
	);
}
