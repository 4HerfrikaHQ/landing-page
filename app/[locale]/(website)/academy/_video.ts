import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
	COURSE_VIDEOS_BUCKET,
	VIDEO_QUALITIES,
	VIDEO_URL_TTL_SECONDS,
	type VideoQuality,
	videoObjectPath,
} from "./_helpers";

function serviceClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) throw new Error("Supabase service credentials are missing");
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}

export type LessonVideo = {
	sources: { src: string; quality: VideoQuality }[];
	captions: string | null;
	expiresAt: Date;
};

export async function getLessonVideo(
	assetKey: string,
	captionsKey: string | null,
): Promise<LessonVideo> {
	const bucket = serviceClient().storage.from(COURSE_VIDEOS_BUCKET);
	const expiresAt = new Date(Date.now() + VIDEO_URL_TTL_SECONDS * 1000);
	const paths = [
		...VIDEO_QUALITIES.map((quality) => videoObjectPath(assetKey, quality)),
		...(captionsKey ? [captionsKey] : []),
	];
	const { data, error } = await bucket.createSignedUrls(
		paths,
		VIDEO_URL_TTL_SECONDS,
	);
	if (error) throw new Error(`Could not sign lesson video: ${error.message}`);

	const urlFor = (path: string) => {
		const entry = data.find((item) => item.path === path);
		if (!entry?.signedUrl) {
			throw new Error(`Lesson video object missing: ${path}`);
		}
		return entry.signedUrl;
	};

	return {
		sources: VIDEO_QUALITIES.map((quality) => ({
			src: urlFor(videoObjectPath(assetKey, quality)),
			quality,
		})),
		captions: captionsKey ? urlFor(captionsKey) : null,
		expiresAt,
	};
}
