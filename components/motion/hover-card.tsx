import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

type HoverCardProps = HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode;
};

/**
 * Lift-on-hover card.
 *
 * Deliberately CSS rather than a motion component. Two reasons:
 *
 * 1. `box-shadow` was being animated per-frame from JS, which repaints the
 *    card on every tick — expensive on a grid of them. A CSS transition on
 *    the same property is composited far more cheaply, and browsers can drop
 *    it under load instead of jamming the main thread.
 * 2. `whileHover` latches on touch devices: the hover state is applied on tap
 *    and never released, so cards sit permanently lifted on phones. Gating
 *    the lift behind `(hover: hover)` means only real pointers ever see it,
 *    while `active:` still gives touch users press feedback.
 *
 * `motion-reduce:` opts out for anyone who has asked for less motion; the
 * global reduced-motion rule in globals.css also collapses the durations.
 */
export function HoverCard({ children, className, ...props }: HoverCardProps) {
	return (
		<div
			className={cn(
				"transition-[transform,box-shadow] duration-200 ease-out",
				"[@media(hover:hover)]:hover:-translate-y-1.5",
				"[@media(hover:hover)]:hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)]",
				"active:scale-[0.98]",
				"motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
