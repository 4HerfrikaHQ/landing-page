import { cn } from "@/utils/cn";

interface ParallaxImageProps {
	/** Fraction of 100px to travel in each direction across the scroll. */
	speed?: number;
	children: React.ReactNode;
	className?: string;
}

/**
 * Scroll parallax, driven by the scroll position itself rather than a JS
 * handler recomputing a transform each frame.
 *
 * Where scroll-driven animation is unsupported the child simply sits still.
 * That is the whole degradation — the image is in its normal position, just
 * not offset — which is a better trade than shipping an animation runtime to
 * every visitor for one decorative element on one desktop breakpoint.
 */
export function ParallaxImage({
	speed = 0.3,
	children,
	className,
}: ParallaxImageProps) {
	return (
		<div className={cn("overflow-hidden", className)}>
			<div
				className="animate-parallax"
				style={
					{
						"--parallax-from": `${speed * -100}px`,
						"--parallax-to": `${speed * 100}px`,
					} as React.CSSProperties
				}
			>
				{children}
			</div>
		</div>
	);
}
