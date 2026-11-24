"use server";

import { db } from "@/src/db";
import { enrolments, taskSubmissions } from "@/src/db/schema/tables";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { and, desc, eq } from "drizzle-orm";
import { actionAccess } from "../_access";
import { getLessonContent } from "../_content";
import { SubmitTaskSchema } from "../_schema";
import { canSubmitTask } from "../_task";

export const submitTask = actionClient
	.schema(SubmitTaskSchema)
	.action(async ({ parsedInput: { uid, lessonKey, track, body } }) => {
		const { enrolment, lesson } = await actionAccess(uid, lessonKey);
		if (lesson.kind !== "task") throw new ActionError("not_a_task");
		const content = await getLessonContent(lesson.id);
		if (content.kind !== "task") throw new ActionError("not_a_task");
		const trackKeys = content.tracks.map((item) => item.key);
		if (trackKeys.length > 0 && (!track || !trackKeys.includes(track))) {
			throw new ActionError("track_required");
		}

		return db.transaction(async (tx) => {
			await tx
				.select({ id: enrolments.id })
				.from(enrolments)
				.where(eq(enrolments.id, enrolment.id))
				.for("update");
			const [latest] = await tx
				.select({ status: taskSubmissions.status })
				.from(taskSubmissions)
				.where(
					and(
						eq(taskSubmissions.enrolment_id, enrolment.id),
						eq(taskSubmissions.lesson_id, lesson.id),
					),
				)
				.orderBy(desc(taskSubmissions.submitted_at))
				.limit(1);
			if (!canSubmitTask(latest?.status ?? null)) {
				throw new ActionError("already_submitted");
			}
			await tx.insert(taskSubmissions).values({
				enrolment_id: enrolment.id,
				lesson_id: lesson.id,
				track: trackKeys.length > 0 ? (track ?? null) : null,
				body,
				status: "submitted",
			});
			return { submitted: true };
		});
	});
