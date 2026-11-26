"use client";

import { cn } from "@/utils/cn";
import { m } from "motion/react";
import type { HTMLAttributes } from "react";
import { EASE_OUT, REVEAL_DISTANCE, REVEAL_DURATION } from "./tokens";
import { useRevealed } from "./use-revealed";

export type RevealDirection = "up" | "down" | "left" | "right" | "scale";

const HIDDEN_TRANSFORM = {
	up: `translateY(${REVEAL_DISTANCE}px)`,
	down: `translateY(${-REVEAL_DISTANCE}px)`,
	left: `translateX(${REVEAL_DISTANCE}px)`,
	right: `translateX(${-REVEAL_DISTANCE}px)`,
	scale: "scale(0.96)",
} satisfies Record<RevealDirection, string>;

const SHOWN_TRANSFORM = {
	up: "translateY(0px)",
	down: "translateY(0px)",
	left: "translateX(0px)",
	right: "translateX(0px)",
	scale: "scale(1)",
} satisfies Record<RevealDirection, string>;

interface FadeInProps
	extends Omit<
		HTMLAttributes<HTMLDivElement>,
		"onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
	> {
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
	const { ref, revealed } = useRevealed<HTMLDivElement>();

	return (
		<m.div
			ref={ref}
			data-motion=""
			initial={{ opacity: 0, transform: HIDDEN_TRANSFORM[direction] }}
			animate={
				revealed
					? {
							opacity: 1,
							transform: SHOWN_TRANSFORM[direction],
							transitionEnd: { transform: "none" },
						}
					: {
							opacity: 0,
							transform: HIDDEN_TRANSFORM[direction],
							transition: { duration: 0 },
						}
			}
			transition={{ duration: REVEAL_DURATION, ease: EASE_OUT, delay }}
			className={cn(className)}
			{...props}
		>
			{children}
		</m.div>
	);
}
