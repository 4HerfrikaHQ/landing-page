import "server-only";
import { createClient } from "@/src/auth";
import { db } from "@/src/db";
import { learners } from "@/src/db/schema/tables";
import { eq } from "drizzle-orm";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
	ACADEMY_HOME_PATH,
	localeFromPath,
	localizedPath,
	resolveNext,
	signInPath,
	welcomePath,
} from "./sign-in/_helpers";

export async function findLearner(authUserId: string) {
	const [learner] = await db
		.select()
		.from(learners)
		.where(eq(learners.auth_user_id, authUserId))
		.limit(1);
	return learner ?? null;
}

export const currentAuthUser = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
});

export const currentLearner = cache(async () => {
	const user = await currentAuthUser();
	return user ? findLearner(user.id) : null;
});

export async function afterSignInPath(authUserId: string, target: string) {
	const learner = await findLearner(authUserId);
	return learner ? target : welcomePath(localeFromPath(target), target);
}

export async function requireLearner(next: string) {
	const locale = await getLocale();
	const target = resolveNext(next, localizedPath(locale, ACADEMY_HOME_PATH));
	const user = await currentAuthUser();
	if (!user) redirect(signInPath(locale, target));
	const learner = await currentLearner();
	if (!learner) redirect(welcomePath(locale, target));
	return learner;
}
