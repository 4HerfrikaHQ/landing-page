import { z } from "zod";

export const MENTOR_IMAGE_ASPECT_RATIO = 4 / 5;
export const MENTOR_IMAGE_CROP_EPSILON = 0.000001;

export type MentorImageCrop = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export const MentorImageCropSchema = z
	.object({
		x: z.number().finite().min(0).max(1),
		y: z.number().finite().min(0).max(1),
		width: z.number().finite().gt(0).max(1),
		height: z.number().finite().gt(0).max(1),
	})
	.superRefine((crop, context) => {
		if (crop.x + crop.width > 1 + MENTOR_IMAGE_CROP_EPSILON) {
			context.addIssue({
				code: "custom",
				message: "Crop exceeds image width.",
			});
		}
		if (crop.y + crop.height > 1 + MENTOR_IMAGE_CROP_EPSILON) {
			context.addIssue({
				code: "custom",
				message: "Crop exceeds image height.",
			});
		}
	});

export function parseMentorImageCrop(value: unknown): MentorImageCrop | null {
	const parsed = MentorImageCropSchema.safeParse(value);
	return parsed.success ? parsed.data : null;
}

export function cropMentorImageToAspectRatio(
	crop: MentorImageCrop,
	targetAspectRatio: number,
): MentorImageCrop {
	if (targetAspectRatio >= MENTOR_IMAGE_ASPECT_RATIO) {
		const height =
			crop.height * (MENTOR_IMAGE_ASPECT_RATIO / targetAspectRatio);
		return { ...crop, y: crop.y + (crop.height - height) / 2, height };
	}

	const width = crop.width * (targetAspectRatio / MENTOR_IMAGE_ASPECT_RATIO);
	return { ...crop, x: crop.x + (crop.width - width) / 2, width };
}
