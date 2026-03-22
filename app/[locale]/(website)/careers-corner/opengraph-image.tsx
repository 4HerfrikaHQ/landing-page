import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Career Corner",
		"Book a free 10-minute call with a mentor and get career guidance.",
	);
}
