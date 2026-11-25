"use client";

import { animate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { EASE_OUT_CUBIC } from "./tokens";
import { useRevealed } from "./use-revealed";

const COUNT_DURATION = 0.9;

const COUNT_PATTERN = /^(\d[\d,]*)(.*)$/;

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
	const match = COUNT_PATTERN.exec(value);
	const digits = match?.[1] ?? value;
	const suffix = match?.[2] ?? "";
	const target = Number(digits.replaceAll(",", ""));
	const countable = !reduced && digits !== "" && !Number.isNaN(target);

	useEffect(() => {
		const node = textRef.current?.firstChild;
		if (!node || !countable) return;
		node.nodeValue = "0";
		return () => {
			node.nodeValue = digits;
		};
	}, [countable, digits]);

	useEffect(() => {
		const node = textRef.current?.firstChild;
		if (!node || !countable || !revealed) return;
		const controls = animate(0, target, {
			duration: COUNT_DURATION,
			ease: EASE_OUT_CUBIC,
			onUpdate: (latest) => {
				node.nodeValue = Math.round(latest).toLocaleString("en-US");
			},
			onComplete: () => {
				node.nodeValue = digits;
			},
		});
		return () => controls.stop();
	}, [countable, revealed, target, digits]);

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
