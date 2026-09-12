import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

type HoverCardProps = HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode;
};

export function HoverCard({ children, className, ...props }: HoverCardProps) {
	return (
		<div
			className={cn(
				"transition duration-200 ease-out",
				"hover:-translate-y-1.5 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)]",
				"active:scale-[0.98]",
				"motion-reduce:transition-none",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
