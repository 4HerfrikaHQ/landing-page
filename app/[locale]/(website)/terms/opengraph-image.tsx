import { contentType, generateOGImage, size } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Terms and Conditions",
		"The rules for using the 4Herfrika website and mentorship platform.",
	);
}
