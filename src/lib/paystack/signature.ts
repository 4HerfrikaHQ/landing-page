import { createHmac, timingSafeEqual } from "node:crypto";

const SHA512_HEX_LENGTH = 128;
const HEX = /^[0-9a-f]+$/i;

export function verifyPaystackSignature(
	rawBody: string,
	signature: string | null,
	secret: string,
): boolean {
	if (!signature || !secret) return false;
	if (signature.length !== SHA512_HEX_LENGTH || !HEX.test(signature)) {
		return false;
	}
	const expected = createHmac("sha512", secret).update(rawBody).digest();
	return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
