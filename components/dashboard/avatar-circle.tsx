import Image from "next/image";

import { cn } from "@/utils/cn";

interface AvatarCircleProps {
	name: string;
	src?: string | null;
	/** Pixel size of the circle. Default 40. */
	size?: number;
	className?: string;
}

function initialsFor(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

/**
 * Round avatar: shows the image when available, otherwise initials in a
 * tinted pink chip. Used across overview, bookings and mentees.
 */
export function AvatarCircle({
	name,
	src,
	size = 40,
	className,
}: AvatarCircleProps) {
	const initials = initialsFor(name) || "?";

	return (
		<span
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-pink text-primary-500",
				className,
			)}
			style={{ width: size, height: size }}
		>
			{src ? (
				<Image
					src={src}
					alt={name}
					fill
					sizes={`${size}px`}
					className="object-cover object-top"
					unoptimized
				/>
			) : (
				<span
					className="font-medium leading-none"
					style={{ fontSize: Math.max(11, Math.round(size * 0.36)) }}
				>
					{initials}
				</span>
			)}
		</span>
	);
}
