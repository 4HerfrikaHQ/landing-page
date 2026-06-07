import { contentType, generateOGImage, size } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Support Our Mission",
		"Your donation helps us reach more girls and create sustainable change across Africa.",
	);
}
