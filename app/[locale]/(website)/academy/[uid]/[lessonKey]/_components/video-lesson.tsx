import { getTranslations } from "next-intl/server";
import { getLessonVideo } from "../../../_video";
import { findProgress } from "../_access";
import { getLessonContent } from "../_content";
import { videoStartSeconds } from "../_helpers";
import type { LessonViewProps } from "../_view";
import { LessonHeading } from "./lesson-heading";
import { RichBody } from "./rich-body";
import { VideoPlayer } from "./video-player";

export async function VideoLesson({ view }: { view: LessonViewProps }) {
	const { access, nav } = view;
	const { enrolment, lesson } = access;
	const [content, progress, t] = await Promise.all([
		getLessonContent(lesson.id),
		findProgress(enrolment.id, lesson.id),
		getTranslations("academy.lesson.video"),
	]);
	if (content.kind !== "video" || !content.assetKey) {
		return (
			<>
				<LessonHeading title={lesson.title} />
				<p className="rounded-2xl bg-surface-indigo p-4 text-secondary-500">
					{t("unavailable")}
				</p>
			</>
		);
	}
	const video = await getLessonVideo(content.assetKey, content.captionsKey);
	const policy = enrolment.completion_policy;
	const completed = progress?.completed_at != null;
	const stored = {
		furthestSeconds: progress?.furthest_position_seconds ?? 0,
		lastSeconds: progress?.last_position_seconds ?? 0,
	};
	return (
		<VideoPlayer
			uid={access.course.uid}
			lessonKey={lesson.key}
			title={lesson.title}
			policy={policy}
			durationSeconds={lesson.durationSeconds}
			completed={completed}
			furthestSeconds={stored.furthestSeconds}
			startSeconds={videoStartSeconds(policy, stored, completed)}
			posterUrl={content.posterUrl}
			initial={{
				sources: video.sources,
				captions: video.captions,
				expiresAtMs: video.expiresAt.getTime(),
			}}
			previousHref={nav.previousHref}
			nextHref={nav.continueHref}
			courseHref={nav.courseHref}
			transcript={
				content.transcript ? <RichBody field={content.transcript} /> : null
			}
		/>
	);
}
