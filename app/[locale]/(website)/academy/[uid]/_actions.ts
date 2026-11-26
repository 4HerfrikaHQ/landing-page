"use server";

import { actionClient } from "@/src/lib/safe-action";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireLearner } from "../_learner";
import { localizedPath } from "../sign-in/_helpers";
import { coursePath } from "./_helpers";
import { startCourse } from "./_start";

const MAX_UID_LENGTH = 200;

const EnrolSchema = z.object({ uid: z.string().min(1).max(MAX_UID_LENGTH) });

export const enrolInCourse = actionClient
	.schema(EnrolSchema)
	.action(async ({ parsedInput: { uid } }) => {
		const locale = await getLocale();
		const learner = await requireLearner(
			localizedPath(locale, coursePath(uid)),
		);
		redirect(localizedPath(locale, await startCourse(learner.id, uid)));
	});
