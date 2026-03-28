import { generateOGImage, size, contentType } from "../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"The Pink Blog",
		"Stories and experiences from women across Africa — finding purpose in the chaos called life.",
	);
}
