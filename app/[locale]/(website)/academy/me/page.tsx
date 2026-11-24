import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { MY_LEARNING_PATH } from "../[uid]/_helpers";
import { requireLearner } from "../_learner";
import { localizedPath } from "../sign-in/_helpers";
import { LearningView } from "./_components/learning-view";
import { loadLearning } from "./_data";
import { splitEntries } from "./_helpers";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("academy.me");
	return { title: t("metaTitle"), robots: { index: false } };
}

export default async function MyLearningPage() {
	const locale = await getLocale();
	const learner = await requireLearner(localizedPath(locale, MY_LEARNING_PATH));
	const { inProgress, completed } = splitEntries(
		await loadLearning(learner.id),
	);
	return (
		<LearningView
			firstName={learner.certificate_name.split(/\s+/)[0]}
			inProgress={inProgress}
			completed={completed}
		/>
	);
}
