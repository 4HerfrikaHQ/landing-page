import "server-only";
import { randomInt } from "node:crypto";
import { createClient } from "@/prismicio";
import * as prismic from "@prismicio/client";
import {
	lessonIdsInCourse,
	toCourse,
	toLearnerQuiz,
	toQuizAnswerKey,
} from "./_helpers";

const CONTENT_LANG = "en-us";
const RANDOM_RESOLUTION = 2 ** 31;

const lessonSummaryFields = [
	"video_lesson.lesson_key",
	"video_lesson.title",
	"video_lesson.duration_seconds",
	"reading.lesson_key",
	"reading.title",
	"reading.minutes",
	"quiz.lesson_key",
	"quiz.title",
	"task.lesson_key",
	"task.title",
];

const partnerFields = ["partner.name", "partner.logo", "partner.attribution"];

function secureRandom() {
	return randomInt(RANDOM_RESOLUTION) / RANDOM_RESOLUTION;
}

async function getLessonSummaries(ids: string[]) {
	if (ids.length === 0) return [];
	return createClient().getAllByIDs(ids, {
		lang: CONTENT_LANG,
		fetch: lessonSummaryFields,
	});
}

function isMissingCourseError(error: unknown) {
	return (
		error instanceof prismic.NotFoundError ||
		error instanceof prismic.ParsingError
	);
}

export async function getCourse(uid: string) {
	try {
		const document = await createClient().getByUID("course", uid, {
			lang: CONTENT_LANG,
			fetchLinks: partnerFields,
		});
		const lessons = await getLessonSummaries(lessonIdsInCourse(document));
		return toCourse(document, lessons);
	} catch (error) {
		if (isMissingCourseError(error)) return null;
		throw error;
	}
}

export async function getCourses() {
	const documents = await createClient().getAllByType("course", {
		lang: CONTENT_LANG,
		fetchLinks: partnerFields,
	});
	const lessonIds = new Set(documents.flatMap(lessonIdsInCourse));
	const lessons = await getLessonSummaries([...lessonIds]);
	return documents.map((document) => toCourse(document, lessons));
}

export async function getLearnerQuiz(quizId: string) {
	const document = await createClient().getByID(quizId, {
		lang: CONTENT_LANG,
	});
	return toLearnerQuiz(document, secureRandom);
}

export async function getQuizAnswerKey(quizId: string) {
	const document = await createClient().getByID(quizId, {
		lang: CONTENT_LANG,
	});
	return toQuizAnswerKey(document);
}
