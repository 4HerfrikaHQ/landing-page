"use client";

import { m } from "motion/react";
import {
	Children,
	type ElementType,
	type HTMLAttributes,
	type ReactElement,
	isValidElement,
} from "react";
import { RevealRoot, type RevealRootTag } from "./reveal-root";
import { ITEM_VARIANTS } from "./reveal-variants";

type RevealGroupProps = HTMLAttributes<HTMLElement> & {
	as?: RevealRootTag;
};

const MOTION_TAGS = m as unknown as Record<string, ElementType>;

function toRevealItem(child: React.ReactNode, wrapperTag: "li" | "div") {
	if (!isValidElement(child)) return child;
	const element = child as ReactElement<Record<string, unknown>>;
	const HostTag =
		typeof element.type === "string" ? MOTION_TAGS[element.type] : undefined;
	if (HostTag) {
		return (
			<HostTag
				key={element.key}
				{...element.props}
				data-motion=""
				variants={ITEM_VARIANTS}
			/>
		);
	}
	const Wrapper = MOTION_TAGS[wrapperTag];
	return (
		<Wrapper key={element.key} data-motion="" variants={ITEM_VARIANTS}>
			{element}
		</Wrapper>
	);
}

export function RevealGroup({
	as = "div",
	children,
	...props
}: RevealGroupProps) {
	const wrapperTag = as === "div" ? "div" : "li";

	return (
		<RevealRoot as={as} {...props}>
			{Children.map(children, (child) => toRevealItem(child, wrapperTag))}
		</RevealRoot>
	);
}
