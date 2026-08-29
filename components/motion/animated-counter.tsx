"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "./use-reveal";

interface AnimatedCounterProps {
	target: number;
	/** Seconds to count from 0 to `target`. */
	duration?: number;
	className?: string;
}

/**
 * Counts up to `target` once it scrolls into view.
 *
 * The one animation on the site that genuinely cannot be CSS: the thing being
 * animated is text content, not a style. It is a bare rAF loop rather than a
 * spring from `motion` — counting to a number does not need a physics engine,
 * and this was the last thing keeping the library in the bundle.
 */
export function AnimatedCounter({
	target,
	duration = 1.5,
	className,
}: AnimatedCounterProps) {
	const { ref, revealed } = useReveal<HTMLSpanElement>();
	const [value, setValue] = useState(0);
	const frame = useRef<number>(undefined);

	useEffect(() => {
		if (!revealed) return;

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setValue(target);
			return;
		}

		const start = performance.now();
		const tick = (now: number) => {
			const progress = Math.min((now - start) / (duration * 1000), 1);
			// Same ease-out as the CSS entrances, so the count settles the way
			// everything else on the page does.
			setValue(Math.round(target * (1 - (1 - progress) ** 3)));
			if (progress < 1) frame.current = requestAnimationFrame(tick);
		};
		frame.current = requestAnimationFrame(tick);

		return () => {
			if (frame.current !== undefined) cancelAnimationFrame(frame.current);
		};
	}, [revealed, target, duration]);

	return (
		<span ref={ref} className={className}>
			{value}
		</span>
	);
}
