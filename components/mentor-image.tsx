import {
	type MentorImageCrop,
	cropMentorImageToAspectRatio,
} from "@/src/lib/mentor-image";
import { cn } from "@/utils/cn";
import Image from "next/image";

type MentorImageProps = {
	src: string;
	alt: string;
	crop?: MentorImageCrop | null;
	aspectRatio?: number;
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
	aspectRatio,
	className,
	sizes,
}: MentorImageProps) {
	const displayCrop =
		crop && aspectRatio
			? cropMentorImageToAspectRatio(crop, aspectRatio)
			: crop;
	const hasCrop =
		displayCrop &&
		displayCrop.x + displayCrop.width <= 1 &&
		displayCrop.y + displayCrop.height <= 1;

	return (
		<div className={cn("relative overflow-hidden", className)}>
			{hasCrop ? (
				<img
					src={src}
					alt={alt}
					className="absolute max-w-none"
					style={{
						width: `${(1 / displayCrop.width) * 100}%`,
						height: `${(1 / displayCrop.height) * 100}%`,
						left: `${-(displayCrop.x / displayCrop.width) * 100}%`,
						top: `${-(displayCrop.y / displayCrop.height) * 100}%`,
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
