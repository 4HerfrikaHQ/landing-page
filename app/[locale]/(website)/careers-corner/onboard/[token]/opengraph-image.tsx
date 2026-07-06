import { contentType, generateOGImage, size } from "../../../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Mentor Onboarding",
		"Set up your availability and complete your 4Herfrika mentor onboarding.",
	);
}
