import { z } from "zod";

export const MENTOR_IMAGE_ASPECT_RATIO = 4 / 5;

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
		if (crop.x + crop.width > 1) {
			context.addIssue({
				code: "custom",
				message: "Crop exceeds image width.",
			});
		}
		if (crop.y + crop.height > 1) {
			context.addIssue({
				code: "custom",
				message: "Crop exceeds image height.",
			});
		}
		if (Math.abs(crop.width / crop.height - MENTOR_IMAGE_ASPECT_RATIO) > 0.01) {
			context.addIssue({
				code: "custom",
				message: "Crop must use a 4:5 aspect ratio.",
			});
		}
	});

export function parseMentorImageCrop(value: unknown): MentorImageCrop | null {
	const parsed = MentorImageCropSchema.safeParse(value);
	return parsed.success ? parsed.data : null;
}
