"use server";

import { db } from "@/src/db";
import { lessonProgress } from "@/src/db/schema/tables";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { and, eq, sql } from "drizzle-orm";
import { getLessonVideo } from "../../../_video";
import { actionAccess } from "../_access";
import { getLessonContent } from "../_content";
import { applyProgress } from "../_helpers";
import { RefreshVideoSchema, ReportProgressSchema } from "../_schema";

export const reportVideoProgress = actionClient
	.schema(ReportProgressSchema)
	.action(async ({ parsedInput: { uid, lessonKey, positionSeconds } }) => {
		const { enrolment, lesson } = await actionAccess(uid, lessonKey);
		if (lesson.kind !== "video") throw new ActionError("not_a_video");
		const policy = enrolment.completion_policy;

		return db.transaction(async (tx) => {
			await tx.execute(
				sql`select pg_advisory_xact_lock(hashtext(${`${enrolment.id}:${lesson.id}`}))`,
			);
			const [row] = await tx
				.select()
				.from(lessonProgress)
				.where(
					and(
						eq(lessonProgress.enrolment_id, enrolment.id),
						eq(lessonProgress.lesson_id, lesson.id),
					),
				)
				.limit(1);
			const now = new Date();
			const update = applyProgress(
				{
					furthestSeconds: row?.furthest_position_seconds ?? 0,
					lastSeconds: row?.last_position_seconds ?? 0,
					updatedAtMs: row ? row.updated_at.getTime() : null,
				},
				{
					positionSeconds,
					nowMs: now.getTime(),
					durationSeconds: lesson.durationSeconds,
					enforce: policy.videoMustFinish && !row?.completed_at,
				},
			);
			await tx
				.insert(lessonProgress)
				.values({
					enrolment_id: enrolment.id,
					lesson_id: lesson.id,
					furthest_position_seconds: update.furthestSeconds,
					last_position_seconds: update.lastSeconds,
					updated_at: now,
				})
				.onConflictDoUpdate({
					target: [lessonProgress.enrolment_id, lessonProgress.lesson_id],
					set: {
						furthest_position_seconds: update.furthestSeconds,
						last_position_seconds: update.lastSeconds,
						updated_at: now,
					},
				});
			return { furthestSeconds: update.furthestSeconds };
		});
	});

export const refreshVideoSources = actionClient
	.schema(RefreshVideoSchema)
	.action(async ({ parsedInput: { uid, lessonKey } }) => {
		const { lesson } = await actionAccess(uid, lessonKey);
		if (lesson.kind !== "video") throw new ActionError("not_a_video");
		const content = await getLessonContent(lesson.id);
		if (content.kind !== "video" || !content.assetKey) {
			throw new ActionError("video_unavailable");
		}
		const video = await getLessonVideo(content.assetKey, content.captionsKey);
		return {
			sources: video.sources,
			captions: video.captions,
			expiresAtMs: video.expiresAt.getTime(),
		};
	});
