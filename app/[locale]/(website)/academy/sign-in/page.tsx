import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AuthCard } from "../_components/auth-card";
import { afterSignInPath, currentAuthUser } from "../_learner";
import { GoogleSignIn, GoogleSignInSoon } from "./_components/google-button";
import { SignInFlow } from "./_components/sign-in-flow";
import { ACADEMY_HOME_PATH, localizedPath, resolveNext } from "./_helpers";
import { isGoogleSignInEnabled } from "./_providers";

const CALLBACK_FAILED = "callback_failed";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("academyAuth.signIn");
	return {
		title: t("metaTitle"),
		description: t("metaDescription"),
		robots: { index: false, follow: false },
	};
}

function firstParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{
		next?: string | string[];
		error?: string | string[];
	}>;
}) {
	const [params, locale, user, googleEnabled] = await Promise.all([
		searchParams,
		getLocale(),
		currentAuthUser(),
		isGoogleSignInEnabled(),
	]);
	const next = resolveNext(
		firstParam(params.next),
		localizedPath(locale, ACADEMY_HOME_PATH),
	);
	if (user) redirect(await afterSignInPath(user.id, next));

	return (
		<AuthCard>
			<SignInFlow
				next={next}
				callbackFailed={firstParam(params.error) === CALLBACK_FAILED}
				google={
					googleEnabled ? <GoogleSignIn next={next} /> : <GoogleSignInSoon />
				}
			/>
		</AuthCard>
	);
}
