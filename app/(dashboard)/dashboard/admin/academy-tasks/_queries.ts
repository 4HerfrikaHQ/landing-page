import "server-only";
import { getCourses } from "@/app/[locale]/(website)/academy/_content";
import { db } from "@/src/db";
import {
	enrolments,
	learners,
	taskSubmissions,
	users,
} from "@/src/db/schema/tables";
import type { TaskSubmissionStatus } from "@/src/db/schema/tables";
import { asc, count, desc, eq, inArray } from "drizzle-orm";
import { describeTask, indexTaskTitles, withAttemptNumbers } from "./_helpers";

export async function getTaskQueue(input: {
	status: TaskSubmissionStatus;
	page: number;
	pageSize: number;
}) {
	const where = eq(taskSubmissions.status, input.status);
	const order =
		input.status === "submitted"
			? asc(taskSubmissions.submitted_at)
			: desc(taskSubmissions.reviewed_at);

	const [rows, [{ total }], [{ waiting }], courses] = await Promise.all([
		db
			.select({
				id: taskSubmissions.id,
				enrolmentId: taskSubmissions.enrolment_id,
				courseId: enrolments.course_id,
				lessonId: taskSubmissions.lesson_id,
				track: taskSubmissions.track,
				body: taskSubmissions.body,
				status: taskSubmissions.status,
				note: taskSubmissions.facilitator_note,
				submittedAt: taskSubmissions.submitted_at,
				reviewedAt: taskSubmissions.reviewed_at,
				reviewerName: users.name,
				learnerName: learners.certificate_name,
				country: learners.country,
			})
			.from(taskSubmissions)
			.innerJoin(enrolments, eq(taskSubmissions.enrolment_id, enrolments.id))
			.innerJoin(learners, eq(enrolments.learner_id, learners.id))
			.leftJoin(users, eq(taskSubmissions.reviewed_by, users.id))
			.where(where)
			.orderBy(order, asc(taskSubmissions.id))
			.limit(input.pageSize)
			.offset((input.page - 1) * input.pageSize),
		db.select({ total: count() }).from(taskSubmissions).where(where),
		db
			.select({ waiting: count() })
			.from(taskSubmissions)
			.where(eq(taskSubmissions.status, "submitted")),
		getCourses(),
	]);

	const enrolmentIds = [...new Set(rows.map((row) => row.enrolmentId))];
	const history =
		enrolmentIds.length === 0
			? []
			: await db
					.select({
						id: taskSubmissions.id,
						enrolmentId: taskSubmissions.enrolment_id,
						lessonId: taskSubmissions.lesson_id,
						body: taskSubmissions.body,
						status: taskSubmissions.status,
						note: taskSubmissions.facilitator_note,
						submittedAt: taskSubmissions.submitted_at,
					})
					.from(taskSubmissions)
					.where(inArray(taskSubmissions.enrolment_id, enrolmentIds))
					.orderBy(asc(taskSubmissions.submitted_at));

	const numbered = withAttemptNumbers(history);
	const attemptById = new Map(numbered.map((item) => [item.id, item.attempt]));
	const titles = indexTaskTitles(courses);
	return {
		total,
		waiting,
		rows: rows.map((row) => {
			const attempt = attemptById.get(row.id) ?? 1;
			return {
				...row,
				attempt,
				...describeTask(titles, row.courseId, row.lessonId),
				previous: numbered.filter(
					(item) =>
						item.enrolmentId === row.enrolmentId &&
						item.lessonId === row.lessonId &&
						item.attempt < attempt,
				),
			};
		}),
	};
}

export type TaskQueueRow = Awaited<
	ReturnType<typeof getTaskQueue>
>["rows"][number];
