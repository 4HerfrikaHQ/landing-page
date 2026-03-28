import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Contact Us",
		"Get in touch with the 4Herfrika team.",
	);
}
