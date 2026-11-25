"use client";

import { cn } from "@/utils/cn";
import { m } from "motion/react";
import { EASE_OUT, REVEAL_DISTANCE, REVEAL_DURATION } from "./tokens";
import { useRevealed } from "./use-revealed";

interface TextRevealProps {
	children: string;
	className?: string;
	delay?: number;
}

const STAGGER = 0.06;

const HIDDEN = {
	opacity: 0,
	transform: `translateY(${REVEAL_DISTANCE}px)`,
	transition: { duration: 0 },
};

const SHOWN = {
	opacity: 1,
	transform: "translateY(0px)",
	transitionEnd: { transform: "none" },
};

export function TextReveal({
	children,
	className,
	delay = 0,
}: TextRevealProps) {
	const words = children.split(" ");
	const { ref, revealed } = useRevealed<HTMLSpanElement>();

	return (
		<span ref={ref} className={className}>
			<span className="sr-only">{children}</span>
			<span aria-hidden="true">
				{words.map((word, i) => (
					<m.span
						// biome-ignore lint/suspicious/noArrayIndexKey: the word list is derived from a static string and never reorders; the index is also the stagger position
						key={`${word}-${i}`}
						data-motion=""
						initial={{
							opacity: 0,
							transform: `translateY(${REVEAL_DISTANCE}px)`,
						}}
						animate={revealed ? SHOWN : HIDDEN}
						transition={{
							duration: REVEAL_DURATION,
							ease: EASE_OUT,
							delay: delay + i * STAGGER,
						}}
						className={cn("inline-block", "mr-[0.25em]")}
					>
						{word}
					</m.span>
				))}
			</span>
		</span>
	);
}
