import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import {
	disconnectMentorGoogleConnection,
	getMentorGoogleCalendarContext,
	getMentorGoogleConnectionStatus,
	mentorGoogleOAuthConfigured,
	retryMentorGoogleRevocation,
	startMentorGoogleOAuth,
} from "@/src/lib/mentor-google-oauth";
import { getMentorProfile } from "../_actions";
import {
	type MentorCalendarCallbackOutcome,
	type MentorCalendarCallbackReason,
	MentorCalendarConnection,
} from "./_components/mentor-calendar-connection";
import { ProfileForm } from "./_components/profile-form";
import { PublicLinkCard } from "./_components/public-link-card";

async function connectMentorGoogleCalendar() {
	"use server";
	return startMentorGoogleOAuth({ returnPath: "/dashboard/mentor/profile" });
}

async function reconnectMentorGoogleCalendar() {
	"use server";
	return startMentorGoogleOAuth({
		forceConsent: true,
		returnPath: "/dashboard/mentor/profile",
	});
}

async function disconnectMentorGoogleCalendar() {
	"use server";
	return disconnectMentorGoogleConnection({ status: "disconnected" });
}

async function retryMentorGoogleAccessRemoval() {
	"use server";
	return retryMentorGoogleRevocation();
}

const ALLOWED_CALLBACK_REASONS: readonly MentorCalendarCallbackReason[] = [
	"oauth_denied",
	"google_account_conflict",
	"expired_state",
	"invalid_state",
	"insufficient_scope",
	"invalid_grant",
	"oauth_exchange_failed",
	"identity_lookup_failed",
	"refresh_token_missing",
	"connection_unavailable",
];

function firstSearchParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function getCallbackOutcome(
	params: Record<string, string | string[] | undefined>,
): MentorCalendarCallbackOutcome | null {
	if (firstSearchParam(params.googleCalendar) !== "error") return null;

	const reason = firstSearchParam(params.reason);
	return {
		reason: ALLOWED_CALLBACK_REASONS.includes(
			reason as MentorCalendarCallbackReason,
		)
			? (reason as MentorCalendarCallbackReason)
			: "connection_unavailable",
	};
}

export default async function MentorProfilePage({
	searchParams,
}: {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
	const mentor = await getMentorProfile();

	if (!mentor) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	const googleConnection = await getMentorGoogleConnectionStatus();
	let currentConnection = googleConnection;
	let healthCheckUnavailable = false;
	if (googleConnection.status === "connected") {
		try {
			await getMentorGoogleCalendarContext();
		} catch {
			healthCheckUnavailable = true;
			currentConnection = await getMentorGoogleConnectionStatus();
		}
	}
	const callbackOutcome = searchParams
		? getCallbackOutcome(await searchParams)
		: null;
	const oauthConfigured = mentorGoogleOAuthConfigured();
	const connectionStatus =
		currentConnection.status === "connected"
			? "connected"
			: currentConnection.status === "reauth_required" ||
					currentConnection.status === "revoked"
				? "reauth_required"
				: "not_connected";

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<FadeIn>
				<PageHeader
					title="Your profile"
					subtitle="This is what mentees see on your public mentor page."
				/>
			</FadeIn>
			<FadeIn delay={0.05}>
				<div className="mb-6">
					<PublicLinkCard
						url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org"}/careercorner/${mentor.slug}`}
					/>
				</div>
			</FadeIn>
			<FadeIn delay={0.075}>
				<div className="mb-6">
					<MentorCalendarConnection
						connection={{
							status: connectionStatus,
							googleEmail: currentConnection.googleEmail,
							connectedAt: currentConnection.connectedAt,
						}}
						actions={{
							connect: oauthConfigured
								? connectMentorGoogleCalendar
								: undefined,
							reconnect: oauthConfigured
								? reconnectMentorGoogleCalendar
								: undefined,
							disconnect: disconnectMentorGoogleCalendar,
							retryRevocation: retryMentorGoogleAccessRemoval,
						}}
						callbackOutcome={callbackOutcome}
						configurationMissing={!oauthConfigured}
						healthCheckUnavailable={healthCheckUnavailable}
						revocationPending={currentConnection.revocationPending}
						canRetryRevocation={currentConnection.canRetryRevocation}
					/>
				</div>
			</FadeIn>
			<FadeIn delay={0.1}>
				<ProfileForm mentor={mentor} />
			</FadeIn>
		</div>
	);
}
