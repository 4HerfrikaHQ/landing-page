import { DataCard, DataCardSection } from "@/components/dashboard/data-card";
import {
	getMentorGoogleCalendarContext,
	getMentorGoogleConnectionStatus,
} from "@/src/lib/mentor-google-oauth";
import { Loader2 } from "lucide-react";
import {
	type MentorCalendarCallbackOutcome,
	MentorCalendarConnection,
	type MentorCalendarConnectionActions,
} from "./mentor-calendar-connection";

export function MentorCalendarCheckingState() {
	return (
		<DataCard>
			<DataCardSection
				aria-busy="true"
				className="flex items-center gap-3 p-6 sm:p-8"
			>
				<Loader2
					className="size-4 animate-spin text-muted-foreground"
					aria-hidden="true"
				/>
				<div>
					<p className="text-sm font-medium text-foreground">
						Google Calendar &amp; Meet
					</p>
					<p className="text-sm text-muted-foreground">Checking connection…</p>
				</div>
			</DataCardSection>
		</DataCard>
	);
}

function MentorCalendarUnavailableState() {
	return (
		<DataCard>
			<DataCardSection className="space-y-1.5 p-6 sm:p-8" role="alert">
				<p className="text-sm font-medium text-foreground">
					Google Calendar &amp; Meet status unavailable
				</p>
				<p className="text-sm leading-5 text-muted-foreground">
					We couldn&apos;t confirm the connection right now. Your profile is
					still available; refresh this page to check again.
				</p>
			</DataCardSection>
		</DataCard>
	);
}

/**
 * Keep the remote Google health check isolated from the stored profile data.
 * The initial connection status is still read authoritatively, and a failed
 * health check is followed by a fresh status read so the badge cannot claim a
 * connection that Google no longer accepts.
 */
export async function MentorCalendarHealth({
	actions,
	callbackOutcome,
	configurationMissing,
}: {
	actions?: MentorCalendarConnectionActions;
	callbackOutcome?: MentorCalendarCallbackOutcome | null;
	configurationMissing?: boolean;
}) {
	let googleConnection: Awaited<
		ReturnType<typeof getMentorGoogleConnectionStatus>
	>;
	try {
		googleConnection = await getMentorGoogleConnectionStatus();
	} catch {
		return <MentorCalendarUnavailableState />;
	}

	let currentConnection = googleConnection;
	let healthCheckUnavailable = false;

	if (googleConnection.status === "connected") {
		try {
			await getMentorGoogleCalendarContext();
		} catch {
			healthCheckUnavailable = true;
			try {
				currentConnection = await getMentorGoogleConnectionStatus();
			} catch {
				return <MentorCalendarUnavailableState />;
			}
		}
	}

	const connectionStatus =
		currentConnection.status === "connected"
			? "connected"
			: currentConnection.status === "reauth_required" ||
					currentConnection.status === "revoked"
				? "reauth_required"
				: "not_connected";

	return (
		<MentorCalendarConnection
			connection={{
				status: connectionStatus,
				googleEmail: currentConnection.googleEmail,
				connectedAt: currentConnection.connectedAt,
			}}
			actions={actions}
			callbackOutcome={callbackOutcome}
			configurationMissing={configurationMissing}
			healthCheckUnavailable={healthCheckUnavailable}
			revocationPending={currentConnection.revocationPending}
			canRetryRevocation={currentConnection.canRetryRevocation}
		/>
	);
}
