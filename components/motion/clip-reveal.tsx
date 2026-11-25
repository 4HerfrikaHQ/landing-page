"use client";

import { m } from "motion/react";
import type { HTMLAttributes } from "react";
import { EASE_IN_OUT } from "./tokens";
import { useRevealed } from "./use-revealed";

const HIDDEN = {
	clipPath: "inset(0 0 100% 0)",
	transition: { duration: 0 },
};

const SHOWN = {
	clipPath: "inset(0 0 0% 0)",
	transitionEnd: { clipPath: "none" },
};

export function ClipReveal({
	children,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	const { ref, revealed } = useRevealed<HTMLDivElement>();

	return (
		<div ref={ref} {...props}>
			<m.div
				data-motion=""
				className="relative h-full w-full"
				initial={{ clipPath: "inset(0 0 100% 0)" }}
				animate={revealed ? SHOWN : HIDDEN}
				transition={{ duration: 0.7, ease: EASE_IN_OUT }}
			>
				{children}
			</m.div>
		</div>
	);
}
