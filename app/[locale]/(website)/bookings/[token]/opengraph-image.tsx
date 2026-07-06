import { contentType, generateOGImage, size } from "../../_lib/og";

export { size, contentType };

export default async function Image() {
	return generateOGImage(
		"Manage Your Booking",
		"View, reschedule, or cancel your 4Herfrika mentorship session.",
	);
}
