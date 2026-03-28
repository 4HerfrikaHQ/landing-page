import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Frequently Asked Questions",
		"Find answers about 4Herfrika's programs, campuses, and how to get involved.",
	);
}
