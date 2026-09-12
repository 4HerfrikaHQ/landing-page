import { describe, expect, test } from "bun:test";
import {
	isTrustedLocalMentorImagePath,
	isTrustedMentorAvatarUrl,
} from "./mentor-image-url";

const SUPABASE_URL = "https://project.supabase.co";

describe("isTrustedMentorAvatarUrl", () => {
	test("allows public mentor avatars on the configured Supabase origin", () => {
		expect(
			isTrustedMentorAvatarUrl(
				"https://project.supabase.co/storage/v1/object/public/mentor-avatars/mentor-id.webp?t=123",
				SUPABASE_URL,
			),
		).toBe(true);
	});

	test("rejects other origins, lookalike hosts, and buckets", () => {
		const invalidUrls = [
			"https://attacker.example/mentor.webp",
			"https://project.supabase.co.attacker.example/storage/v1/object/public/mentor-avatars/mentor.webp",
			"https://project.supabase.co/storage/v1/object/public/mentor-cvs/mentor.webp",
			"https://project.supabase.co/storage/v1/object/public/mentor-avatars/",
		];

		for (const url of invalidUrls) {
			expect(isTrustedMentorAvatarUrl(url, SUPABASE_URL)).toBe(false);
		}
	});

	test("allows the local Supabase development origin only when configured", () => {
		expect(
			isTrustedMentorAvatarUrl(
				"http://127.0.0.1:54321/storage/v1/object/public/mentor-avatars/mentor.png",
				"http://127.0.0.1:54321",
			),
		).toBe(true);
		expect(
			isTrustedMentorAvatarUrl(
				"http://127.0.0.1:54321/storage/v1/object/public/mentor-avatars/mentor.png",
				SUPABASE_URL,
			),
		).toBe(false);
	});
});

describe("isTrustedLocalMentorImagePath", () => {
	test("allows only image files in the bundled careers asset directory", () => {
		expect(isTrustedLocalMentorImagePath("/assets/careers/Adesewa.png")).toBe(
			true,
		);
		expect(isTrustedLocalMentorImagePath("/../../etc/passwd")).toBe(false);
		expect(isTrustedLocalMentorImagePath("/assets/careers/../secret.png")).toBe(
			false,
		);
	});
});
