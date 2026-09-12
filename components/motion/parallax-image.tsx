import { cn } from "@/utils/cn";

interface ParallaxImageProps {
	speed?: number;
	children: React.ReactNode;
	className?: string;
}

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
