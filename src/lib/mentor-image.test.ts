import { describe, expect, test } from "bun:test";
import {
	MentorImageCropSchema,
	cropMentorImageToAspectRatio,
} from "./mentor-image";

describe("MentorImageCropSchema", () => {
	test("accepts normalized 4:5 framing from a landscape source", () => {
		const result = MentorImageCropSchema.safeParse({
			x: 0.15,
			y: 0,
			width: 0.64,
			height: 1,
		});

		expect(result.success).toBe(true);
	});

	test("rejects framing outside the source image", () => {
		expect(
			MentorImageCropSchema.safeParse({
				x: 0.5,
				y: 0,
				width: 0.6,
				height: 1,
			}).success,
		).toBe(false);
	});

	test("accepts harmless floating-point overflow at an image edge", () => {
		expect(
			MentorImageCropSchema.safeParse({
				x: 0.35518403,
				y: 0,
				width: 0.64481605,
				height: 1,
			}).success,
		).toBe(true);
	});
});

describe("cropMentorImageToAspectRatio", () => {
	test("derives a centered square safe area from the portrait crop", () => {
		const square = cropMentorImageToAspectRatio(
			{ x: 0.2, y: 0.1, width: 0.64, height: 0.8 },
			1,
		);

		expect(square.x).toBe(0.2);
		expect(square.y).toBeCloseTo(0.18);
		expect(square.width).toBe(0.64);
		expect(square.height).toBeCloseTo(0.64);
	});
});
