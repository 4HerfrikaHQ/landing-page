"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "./use-reveal";

interface AnimatedCounterProps {
	target: number;
	duration?: number;
	className?: string;
}

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
