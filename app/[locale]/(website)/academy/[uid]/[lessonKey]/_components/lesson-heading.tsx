import type { ReactNode } from "react";

export function LessonHeading({
	title,
	children,
}: {
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			{children}
			<h1 className="text-3xl leading-tight font-semibold text-secondary-500 lg:text-4xl">
				{title}
			</h1>
		</div>
	);
}

export function Badge({ children }: { children: ReactNode }) {
	return (
		<span className="w-fit rounded-full bg-surface-pink px-3 py-1 text-sm font-medium text-primary-700">
			{children}
		</span>
	);
}
