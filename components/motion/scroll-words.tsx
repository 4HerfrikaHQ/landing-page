"use client";

import {
	type MotionValue,
	m,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";

const DIM = 0.2;

function Word({
	word,
	index,
	count,
	progress,
}: {
	word: string;
	index: number;
	count: number;
	progress: MotionValue<number>;
}) {
	const opacity = useTransform(
		progress,
		[index / count, (index + 1) / count],
		[DIM, 1],
	);
	return (
		<m.span style={{ opacity }} className="mr-[0.25em] inline-block">
			{word}
		</m.span>
	);
}

export function ScrollWords({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	const ref = useRef<HTMLParagraphElement>(null);
	const reduced = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 0.9", "end 0.7"],
	});
	const words = children.split(" ");

	if (reduced) {
		return <p className={className}>{children}</p>;
	}

	return (
		<p ref={ref} className={className}>
			<span className="sr-only">{children}</span>
			<span aria-hidden="true">
				{words.map((word, index) => (
					<Word
						// biome-ignore lint/suspicious/noArrayIndexKey: words come from a static string and never reorder
						key={`${word}-${index}`}
						word={word}
						index={index}
						count={words.length}
						progress={scrollYProgress}
					/>
				))}
			</span>
		</p>
	);
}
