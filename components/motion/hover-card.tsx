import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

type HoverCardProps = HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode;
};

/**
 * Lift-on-hover card.
 *
 * CSS rather than a motion component: `box-shadow` was being animated
 * per-frame from JS, which repaints the card on every tick — expensive on a
 * grid of them — and `whileHover` latches on touch, leaving cards permanently
 * lifted after a tap on a phone.
 *
 * Tailwind v4 already compiles `hover:` to `@media (hover: hover) { &:hover }`,
 * so touch devices never match it and no extra guard is needed. (Wrapping it
 * by hand in `[@media(hover:hover)]:hover:` produces no CSS at all.) `active:`
 * gives touch users press feedback instead.
 */
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
