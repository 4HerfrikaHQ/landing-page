import { contentType, generateOGImage, size } from "../../../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Session Feedback",
		"Share feedback on your 4Herfrika mentorship session.",
	);
}
