"use server";

import { createClient } from "@/src/auth";
import { db } from "@/src/db";
import { learners } from "@/src/db/schema/tables";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { DEFAULT_COMPLETION_POLICY } from "../_helpers";
import {
	ACADEMY_HOME_PATH,
	localizedPath,
	resolveNext,
} from "../sign-in/_helpers";
import { CreateLearnerSchema } from "./_schema";

export const createLearner = actionClient
	.schema(CreateLearnerSchema)
	.action(
		async ({ parsedInput: { certificateName, country, campus, next } }) => {
			const supabase = await createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new ActionError("session_expired");

			await db
				.insert(learners)
				.values({
					auth_user_id: user.id,
					certificate_name: certificateName,
					country,
					campus: campus || null,
					age_confirmed_at: new Date(),
					age_confirmed_min: DEFAULT_COMPLETION_POLICY.minAge,
				})
				.onConflictDoNothing({ target: learners.auth_user_id });

			const locale = await getLocale();
			redirect(resolveNext(next, localizedPath(locale, ACADEMY_HOME_PATH)));
		},
	);
