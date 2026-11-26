"use client";

import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";

export function LayoutMotion({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={domMax} strict>
			{children}
		</LazyMotion>
	);
}
