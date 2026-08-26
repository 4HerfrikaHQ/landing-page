// Server-only mentor OAuth callback route. Google must be configured with this exact path.
import {
	finishMentorGoogleOAuth,
	mentorGoogleOAuthErrorReason,
} from "@/src/lib/mentor-google-oauth";
import {
	MentorGoogleOAuthError,
	safeMentorReturnPath,
} from "@/src/lib/mentor-google-oauth-core";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const state = request.nextUrl.searchParams.get("state");
	if (!state) {
		return NextResponse.json(
			{ error: "Invalid Google OAuth callback" },
			{ status: 400 },
		);
	}

	try {
		const result = await finishMentorGoogleOAuth({
			state,
			code: request.nextUrl.searchParams.get("code"),
		});
		return NextResponse.redirect(new URL(result.returnPath, request.url));
	} catch (error) {
		const returnPath = safeMentorReturnPath(
			error instanceof MentorGoogleOAuthError ? error.returnPath : undefined,
		);
		const redirectUrl = new URL(returnPath, request.url);
		redirectUrl.searchParams.set("googleCalendar", "error");
		redirectUrl.searchParams.set("reason", mentorGoogleOAuthErrorReason(error));
		return NextResponse.redirect(redirectUrl);
	}
}
