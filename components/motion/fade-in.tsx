"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { DURATION, EASE_OUT, TRAVEL, VIEWPORT } from "./tokens";

type Direction = "up" | "down" | "left" | "right";

interface FadeInProps extends HTMLMotionProps<"div"> {
	direction?: Direction;
	delay?: number;
	duration?: number;
	children: React.ReactNode;
}

const offsets: Record<Direction, { x: number; y: number }> = {
	up: { x: 0, y: TRAVEL },
	down: { x: 0, y: -TRAVEL },
	left: { x: TRAVEL, y: 0 },
	right: { x: -TRAVEL, y: 0 },
};

export function FadeIn({
	direction = "up",
	delay = 0,
	duration = DURATION.enter,
	children,
	...props
}: FadeInProps) {
	const shouldReduce = useReducedMotion();
	const offset = offsets[direction];

	return (
		<motion.div
			initial={
				shouldReduce ? { opacity: 0 } : { opacity: 0, x: offset.x, y: offset.y }
			}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={VIEWPORT}
			transition={{ duration, delay, ease: EASE_OUT }}
			{...props}
		>
			{children}
		</motion.div>
	);
}
