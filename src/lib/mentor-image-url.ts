const AVATAR_BUCKET_PATH = "/storage/v1/object/public/mentor-avatars/";

export function isTrustedMentorAvatarUrl(
	value: string,
	supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
): boolean {
	if (!supabaseUrl) return false;

	try {
		const candidate = new URL(value);
		const storageOrigin = new URL(supabaseUrl);
		const basePath = storageOrigin.pathname.replace(/\/$/, "");
		const avatarPath = `${basePath}${AVATAR_BUCKET_PATH}`;

		return (
			(candidate.protocol === "https:" ||
				candidate.hostname === "localhost" ||
				candidate.hostname === "127.0.0.1") &&
			candidate.origin === storageOrigin.origin &&
			candidate.username === "" &&
			candidate.password === "" &&
			candidate.pathname.startsWith(avatarPath) &&
			candidate.pathname.length > avatarPath.length
		);
	} catch {
		return false;
	}
}

export function isTrustedLocalMentorImagePath(value: string): boolean {
	return /^\/assets\/careers\/[a-z0-9._-]+\.(?:jpe?g|png|webp)$/i.test(value);
}
