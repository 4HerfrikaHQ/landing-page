import { expect, test } from "bun:test";
import {
	decryptMentorRefreshToken,
	encryptMentorRefreshToken,
} from "./mentor-google-crypto";

const key = Buffer.alloc(32, 7);

test("mentor refresh token encryption round-trips and binds to the mentor", () => {
	const ciphertext = encryptMentorRefreshToken(
		"synthetic-refresh-token",
		"mentor-a",
		key,
	);

	expect(decryptMentorRefreshToken(ciphertext, "mentor-a", key)).toBe(
		"synthetic-refresh-token",
	);
	expect(() =>
		decryptMentorRefreshToken(ciphertext, "mentor-b", key),
	).toThrow();
});

test("mentor refresh token encryption rejects tampering", () => {
	const ciphertext = encryptMentorRefreshToken(
		"synthetic-refresh-token",
		"mentor-a",
		key,
	);
	const tampered = `${ciphertext.slice(0, -1)}${ciphertext.endsWith("a") ? "b" : "a"}`;

	expect(() => decryptMentorRefreshToken(tampered, "mentor-a", key)).toThrow();
});

test("mentor refresh token key validation is strict", () => {
	expect(() =>
		encryptMentorRefreshToken(
			"synthetic-refresh-token",
			"mentor-a",
			Buffer.alloc(31),
		),
	).toThrow(/32 bytes/);
});
