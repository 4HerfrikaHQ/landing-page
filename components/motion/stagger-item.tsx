"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { DURATION, EASE_OUT, TRAVEL } from "./tokens";

interface StaggerItemProps extends HTMLMotionProps<"div"> {
	children: React.ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
	const shouldReduce = useReducedMotion();

	return (
		<motion.div
			variants={{
				hidden: shouldReduce ? { opacity: 0 } : { opacity: 0, y: TRAVEL },
				visible: {
					opacity: 1,
					y: 0,
					transition: { duration: DURATION.item, ease: EASE_OUT },
				},
			}}
			{...props}
		>
			{children}
		</motion.div>
	);
}
