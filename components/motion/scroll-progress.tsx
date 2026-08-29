import { cn } from "@/utils/cn";

/**
 * Reading-progress bar.
 *
 * Was a `useScroll` + `useSpring` pair recomputing and writing a transform on
 * every scroll frame, from the main thread, on every page. `animation-timeline:
 * scroll()` hands the same job to the compositor: no JS, no scroll listener,
 * and it cannot fall behind the scroll the way a main-thread handler does.
 *
 * Where scroll-driven animation is unsupported (~15% of traffic, chiefly
 * Safari before 26) the bar stays at `scaleX(0)` and is simply not shown. It
 * is a decorative affordance, so absence is a fine degradation — the
 * alternative would be shipping the JS version to everyone.
 */
export function ScrollProgress() {
	return (
		<div
			data-site-scroll-progress
			aria-hidden="true"
			className={cn(
				"fixed top-0 left-0 right-0 h-1 origin-left scale-x-0 bg-primary-500 z-[100]",
				"animate-scroll-progress",
			)}
		/>
	);
}
