import { contentType, generateOGImage, size } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Privacy Policy",
		"How we collect and protect your data on the 4Herfrika mentorship platform.",
	);
}
