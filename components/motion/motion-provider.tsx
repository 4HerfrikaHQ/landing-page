"use client";

import {
	LazyMotion,
	MotionConfig,
	domAnimation,
	useReducedMotion,
} from "motion/react";

export function MotionProvider({ children }: { children: React.ReactNode }) {
	const reduceMotion = useReducedMotion() ?? false;
	return (
		<LazyMotion features={domAnimation} strict>
			<MotionConfig reducedMotion="user" skipAnimations={reduceMotion}>
				{children}
			</MotionConfig>
		</LazyMotion>
	);
}
