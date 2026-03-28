import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Our Projects",
		"Grassroots-driven, impact-focused projects designed to uplift girls across Africa.",
	);
}
