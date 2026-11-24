import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthCard } from "../_components/auth-card";
import { DEFAULT_COMPLETION_POLICY } from "../_helpers";
import { currentAuthUser, findLearner } from "../_learner";
import {
	ACADEMY_HOME_PATH,
	localizedPath,
	resolveNext,
	signInPath,
	welcomePath,
} from "../sign-in/_helpers";
import { WelcomeForm } from "./_components/welcome-form";
import { countryOptions } from "./_helpers";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("academyAuth.welcome");
	return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function WelcomePage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string | string[] }>;
}) {
	const [params, locale, user] = await Promise.all([
		searchParams,
		getLocale(),
		currentAuthUser(),
	]);
	const requested = Array.isArray(params.next) ? params.next[0] : params.next;
	const next = resolveNext(requested, localizedPath(locale, ACADEMY_HOME_PATH));
	if (!user) redirect(signInPath(locale, welcomePath(locale, next)));
	if (await findLearner(user.id)) redirect(next);

	return (
		<AuthCard>
			<WelcomeForm
				next={next}
				minAge={DEFAULT_COMPLETION_POLICY.minAge}
				countries={countryOptions(locale)}
			/>
		</AuthCard>
	);
}
