import type { HTMLAttributes } from "react";
import { RevealRoot } from "./reveal-root";

interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export function StaggerContainer({
	children,
	...props
}: StaggerContainerProps) {
	return (
		<RevealRoot as="div" {...props}>
			{children}
		</RevealRoot>
	);
}
