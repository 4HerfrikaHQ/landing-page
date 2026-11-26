"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

export function ScrollDrift({
	children,
	distance = 120,
	className,
}: {
	children: ReactNode;
	distance?: number;
	className?: string;
}) {
	const reduced = useReducedMotion();
	const { scrollY } = useScroll();
	const y = useTransform(scrollY, [0, 900], [0, reduced ? 0 : distance], {
		clamp: true,
	});

	return (
		<m.div style={{ y }} className={className}>
			{children}
		</m.div>
	);
}
