export const MENTOR_SLUG_MAX_LENGTH = 64;
export const MENTOR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_MENTOR_SLUGS = new Set(["apply", "onboard"]);

export type MentorSlugResult =
	| { success: true; slug: string }
	| { success: false; error: string };

export function normalizeMentorSlugInput(input: string): string {
	return input.toLowerCase().replace(/\s+/g, "-");
}

export function parseMentorSlug(
	input: FormDataEntryValue | null,
): MentorSlugResult {
	const slug =
		typeof input === "string" ? normalizeMentorSlugInput(input.trim()) : "";

	if (!slug) {
		return { success: false, error: "Profile link is required." };
	}
	if (slug.length > MENTOR_SLUG_MAX_LENGTH) {
		return {
			success: false,
			error: `Profile link must be ${MENTOR_SLUG_MAX_LENGTH} characters or fewer.`,
		};
	}
	if (!MENTOR_SLUG_PATTERN.test(slug)) {
		return {
			success: false,
			error: "Use only lowercase letters, numbers, and single hyphens.",
		};
	}
	if (RESERVED_MENTOR_SLUGS.has(slug)) {
		return { success: false, error: "This profile link is reserved." };
	}

	return { success: true, slug };
}

export function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === "23505"
	);
}
