import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Raising World-Class Female Leaders",
		"At the intersection of business and technology in Africa",
	);
}
