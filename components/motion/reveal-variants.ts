import type { Variants } from "motion/react";
import {
	EASE_OUT,
	REVEAL_DISTANCE,
	REVEAL_DURATION,
	STAGGER_MAX,
	STAGGER_STEP,
} from "./tokens";

export const ITEM_VARIANTS: Variants = {
	hidden: {
		opacity: 0,
		transform: `translateY(${REVEAL_DISTANCE}px)`,
		transition: { duration: 0 },
	},
	show: {
		opacity: 1,
		transform: "translateY(0px)",
		transition: { duration: REVEAL_DURATION, ease: EASE_OUT },
		transitionEnd: { transform: "none" },
	},
};

export function groupVariants(count: number): Variants {
	const step = Math.min(STAGGER_STEP, STAGGER_MAX / Math.max(count - 1, 1));
	return {
		hidden: {},
		show: { transition: { staggerChildren: step } },
	};
}
