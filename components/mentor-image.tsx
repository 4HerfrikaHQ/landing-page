import type { MentorImageCrop } from "@/src/lib/mentor-image";
import { cn } from "@/utils/cn";
import Image from "next/image";

type MentorImageProps = {
	src: string;
	alt: string;
	crop?: MentorImageCrop | null;
	className?: string;
	sizes?: string;
};

/**
 * Renders a mentor source image using the saved crop rectangle. Cropped images
 * use a native image because its dimensions and offsets are intentionally
 * controlled by the crop metadata; unedited legacy images keep Next Image's
 * normal optimization path.
 */
export function MentorImage({
	src,
	alt,
	crop,
	className,
	sizes,
}: MentorImageProps) {
	const hasCrop = crop && crop.x + crop.width <= 1 && crop.y + crop.height <= 1;

	return (
		<div className={cn("relative overflow-hidden", className)}>
			{hasCrop ? (
				<img
					src={src}
					alt={alt}
					className="absolute max-w-none"
					style={{
						width: `${(1 / crop.width) * 100}%`,
						height: `${(1 / crop.height) * 100}%`,
						left: `${-(crop.x / crop.width) * 100}%`,
						top: `${-(crop.y / crop.height) * 100}%`,
					}}
				/>
			) : (
				<Image
					src={src}
					alt={alt}
					fill
					sizes={sizes}
					unoptimized={src.includes("localhost") || src.includes("127.0.0.1")}
					className="object-cover object-center"
				/>
			)}
		</div>
	);
}
