import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Our Story in Motion",
		"3,000+ girls mentored, 25+ campuses reached, 1,000+ Tech Academy graduates.",
	);
}
