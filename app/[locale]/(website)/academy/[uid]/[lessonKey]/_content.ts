import "server-only";
import { createClient } from "@/prismicio";
import { LessonDocument } from "./_schema";

const CONTENT_LANG = "en-us";

function toLessonContent(document: unknown) {
	const lesson = LessonDocument.parse(document);
	if (lesson.type === "video_lesson") {
		return {
			kind: "video" as const,
			assetKey: lesson.data.video_asset_key,
			captionsKey: lesson.data.captions_key,
			posterUrl: lesson.data.poster,
			transcript: lesson.data.transcript,
		};
	}
	if (lesson.type === "reading") {
		return {
			kind: "reading" as const,
			minutes: lesson.data.minutes ?? null,
			body: lesson.data.body,
		};
	}
	if (lesson.type === "task") {
		return {
			kind: "task" as const,
			instructions: lesson.data.instructions,
			tracks: (lesson.data.tracks ?? []).flatMap((track) =>
				track.track_key
					? [
							{
								key: track.track_key,
								title: track.title ?? track.track_key,
								instructions: track.instructions,
							},
						]
					: [],
			),
		};
	}
	return { kind: "quiz" as const };
}

export type LessonContent = ReturnType<typeof toLessonContent>;

export async function getLessonContent(lessonId: string) {
	const document = await createClient().getByID(lessonId, {
		lang: CONTENT_LANG,
	});
	return toLessonContent(document);
}
