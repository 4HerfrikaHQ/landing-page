"use client";

import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";
import { useReveal } from "./use-reveal";

export type RevealDirection = "up" | "down" | "left" | "right" | "scale";

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
	direction?: RevealDirection;
	/** Seconds to hold before this element starts. */
	delay?: number;
	children: React.ReactNode;
}

/**
 * Entrance reveal.
 *
 * The animation is CSS keyframes (see `globals.css`); the only thing JS does
 * is flip `data-revealed` when the element reaches the viewport. That keeps
 * the per-frame work on the compositor instead of in React, and drops the
 * `motion` runtime from every page that only ever used it to fade things in.
 */
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
