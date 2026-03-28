import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"About 4Herfrika",
		"Training, mentoring, and empowering women to become transformative leaders across Africa.",
	);
}
