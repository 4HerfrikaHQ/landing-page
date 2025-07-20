"use client";

import { cn } from "@/utils/cn";
import { motion, stagger, useAnimate } from "motion/react";
import { useEffect } from "react";

export const TextGenerateEffect = ({
	words,
	className,
	textClassName,
	filter = true,
	duration = 0.5,
}: {
	words: string;
	className?: string;
	textClassName?: string;
	filter?: boolean;
	duration?: number;
}) => {
	const [scope, animate] = useAnimate();
	const wordsArray = words.split(" ");

	useEffect(() => {
		animate(
			"span",
			{
				opacity: 1,
				filter: filter ? "blur(0px)" : "none",
			},
			{
				duration: duration ? duration : 1,
				delay: stagger(0.2),
			},
		);
	}, [animate, filter, duration]);

	const renderWords = () => {
		return (
			<motion.div ref={scope}>
				{wordsArray.map((word) => {
					return (
						<motion.span
							key={word}
							className={cn("opacity-0", textClassName)}
							style={{
								filter: filter ? "blur(10px)" : "none",
							}}
						>
							{word}{" "}
						</motion.span>
					);
				})}
			</motion.div>
		);
	};

	return (
		<div className={cn(className)}>
			<div className="mt-4">
				<div>{renderWords()}</div>
			</div>
		</div>
	);
};
