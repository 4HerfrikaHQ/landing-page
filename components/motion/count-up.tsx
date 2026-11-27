"use client";

import { animate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { formatCount, parseCount } from "./count-format";
import { EASE_OUT_CUBIC } from "./tokens";
import { useRevealed } from "./use-revealed";

const COUNT_DURATION = 1.2;

type CountUpProps = {
	value: string;
	className?: string;
};

export function CountUp({ value, className }: CountUpProps) {
	const textRef = useRef<HTMLSpanElement>(null);
	const reduced = useReducedMotion();
	const { ref: revealRef, revealed } = useRevealed<HTMLSpanElement>();
	const setRef = useCallback(
		(el: HTMLSpanElement | null) => {
			textRef.current = el;
			return revealRef(el);
		},
		[revealRef],
	);
	const { digits, suffix, target, grouped } = parseCount(value);
	const countable = !reduced && target !== null;

	useEffect(() => {
		const node = textRef.current?.firstChild;
		if (!node || !countable) return;
		if (!revealed) {
			node.nodeValue = formatCount(0, grouped);
			return;
		}
		const controls = animate(0, target, {
			duration: COUNT_DURATION,
			ease: EASE_OUT_CUBIC,
			onUpdate: (latest) => {
				node.nodeValue = formatCount(Math.round(latest), grouped);
			},
			onComplete: () => {
				node.nodeValue = digits;
			},
		});
		return () => controls.stop();
	}, [countable, revealed, target, digits, grouped]);

	return (
		<>
			<span
				ref={setRef}
				style={{ minWidth: `${digits.length}ch` }}
				className={className ?? "inline-block text-end tabular-nums"}
			>
				{digits}
			</span>
			{suffix}
		</>
	);
}
