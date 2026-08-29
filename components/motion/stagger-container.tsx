"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { STAGGER, VIEWPORT } from "./tokens";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
	staggerDelay?: number;
	children: React.ReactNode;
}

export function StaggerContainer({
	staggerDelay = STAGGER,
	children,
	...props
}: StaggerContainerProps) {
	const shouldReduce = useReducedMotion();

	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={VIEWPORT}
			variants={{
				visible: {
					transition: {
						staggerChildren: shouldReduce ? 0 : staggerDelay,
					},
				},
			}}
			{...props}
		>
			{children}
		</motion.div>
	);
}
