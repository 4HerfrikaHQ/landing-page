import { afterSignInPath } from "@/app/[locale]/(website)/academy/_learner";
import {
	ACADEMY_HOME_PATH,
	localeFromPath,
	localizedPath,
	resolveNext,
	signInPath,
} from "@/app/[locale]/(website)/academy/sign-in/_helpers";
import { routing } from "@/i18n/routing";
import { createClient } from "@/src/auth";
import { type NextRequest, NextResponse } from "next/server";

const CALLBACK_FAILED = "callback_failed";

export async function GET(request: NextRequest) {
	const { searchParams, origin } = request.nextUrl;
	const code = searchParams.get("code");
	const target = resolveNext(
		searchParams.get("next"),
		localizedPath(routing.defaultLocale, ACADEMY_HOME_PATH),
	);

	if (code) {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error && data.user) {
			return NextResponse.redirect(
				new URL(await afterSignInPath(data.user.id, target), origin),
			);
		}
	}

	const failure = new URL(signInPath(localeFromPath(target), target), origin);
	failure.searchParams.set("error", CALLBACK_FAILED);
	return NextResponse.redirect(failure);
}
