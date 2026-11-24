import type { Block, CourseManifest, Lesson } from "./_schema";

export type LessonType = "video_lesson" | "reading" | "quiz" | "task";

export type PlannedDocument = {
	type: "partner" | "course" | LessonType;
	identity: string;
	uid?: string;
	title: string;
	data: Record<string, unknown>;
};

export type LinkTo = (
	type: PlannedDocument["type"],
	identity: string,
) => unknown;

const lessonTypeByKind: Record<Lesson["kind"], LessonType> = {
	video: "video_lesson",
	reading: "reading",
	quiz: "quiz",
	task: "task",
};

export function toRichText(blocks: Block[] | undefined) {
	return (blocks ?? []).map(({ type, text }) => ({ type, text, spans: [] }));
}

function lessonData(lesson: Lesson): Record<string, unknown> {
	const base = { lesson_key: lesson.key, title: lesson.title };
	switch (lesson.kind) {
		case "video":
			return {
				...base,
				video_asset_key: lesson.videoAssetKey,
				duration_seconds: lesson.durationSeconds,
				captions_key: lesson.captionsKey ?? null,
				transcript: toRichText(lesson.transcript),
			};
		case "reading":
			return {
				...base,
				minutes: lesson.minutes,
				body: toRichText(lesson.body),
			};
		case "quiz":
			return {
				...base,
				questions: lesson.questions.map((question) => ({
					question_key: question.key,
					prompt: question.prompt,
					option_a: question.options[0],
					option_b: question.options[1],
					option_c: question.options[2],
					option_d: question.options[3],
					correct: question.correct,
					why: question.why,
					topic: question.topic ?? null,
				})),
			};
		case "task":
			return {
				...base,
				instructions: toRichText(lesson.instructions),
				tracks: lesson.tracks.map((track) => ({
					track_key: track.key,
					title: track.title,
					instructions: toRichText(track.instructions),
				})),
			};
	}
}

export function lessonDocuments(manifest: CourseManifest): PlannedDocument[] {
	return manifest.modules.flatMap((module) =>
		module.lessons.map((lesson) => ({
			type: lessonTypeByKind[lesson.kind],
			identity: lesson.key,
			title: `${lesson.key} · ${lesson.title}`,
			data: lessonData(lesson),
		})),
	);
}

export function partnerDocuments(manifest: CourseManifest): PlannedDocument[] {
	return manifest.partners.map((partner) => ({
		type: "partner",
		identity: partner.uid,
		uid: partner.uid,
		title: partner.name,
		data: {
			name: partner.name,
			website: partner.website
				? { link_type: "Web", url: partner.website }
				: { link_type: "Web" },
			attribution: partner.attribution ?? null,
		},
	}));
}

export function courseDocument(
	manifest: CourseManifest,
	linkTo: LinkTo,
): PlannedDocument {
	const { course } = manifest;
	return {
		type: "course",
		identity: course.uid,
		uid: course.uid,
		title: course.title,
		data: {
			title: course.title,
			summary: course.summary,
			track: course.track,
			level: course.level,
			hours_label: course.hoursLabel,
			outcomes: course.outcomes.map((outcome) => ({ outcome })),
			partners: manifest.partners.map((partner) => ({
				partner: linkTo("partner", partner.uid),
			})),
			notice: toRichText(course.notice),
			pass_mark_percent: course.policy.passMarkPercent,
			attempt_rule: course.policy.attemptRule,
			attempt_value: course.policy.attemptValue,
			fail_feedback: course.policy.failFeedback,
			reveal_answers_on_pass: course.policy.revealAnswersOnPass,
			video_must_finish: course.policy.videoMustFinish,
			reading_ack: course.policy.readingAck,
			sequential_unlock: course.policy.sequentialUnlock,
			tasks_required: course.policy.tasksRequired,
			min_age: course.policy.minAge,
			certificate_issuer: course.certificate.issuer,
			certificate_attribution: course.certificate.attribution ?? null,
			certificate_signatories: course.certificate.signatories.map(
				({ name, title }) => ({ name, title: title ?? null }),
			),
			slices: manifest.modules.map((module) => ({
				slice_type: "course_module",
				variation: "default",
				primary: {
					module_key: module.key,
					title: module.title,
					summary: module.summary ?? null,
					lessons: module.lessons.map((lesson) => ({
						lesson: linkTo(lessonTypeByKind[lesson.kind], lesson.key),
						required: lesson.required,
					})),
				},
				items: [],
			})),
		},
	};
}
