"use client";

import { m } from "motion/react";
import { Children, useMemo } from "react";
import { groupVariants } from "./reveal-variants";
import { useRevealed } from "./use-revealed";

export type RevealRootTag = "div" | "ul" | "ol";

type RevealRootProps = Omit<
	React.HTMLAttributes<HTMLElement>,
	"onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> & {
	as: RevealRootTag;
};

export function RevealRoot({ as, children, ...props }: RevealRootProps) {
	const { ref, revealed } = useRevealed<HTMLElement>();
	const count = Children.count(children);
	const variants = useMemo(() => groupVariants(count), [count]);
	const Tag = m[as];

	return (
		<Tag
			ref={ref}
			variants={variants}
			initial="hidden"
			animate={revealed ? "show" : "hidden"}
			{...props}
		>
			{children}
		</Tag>
	);
}
