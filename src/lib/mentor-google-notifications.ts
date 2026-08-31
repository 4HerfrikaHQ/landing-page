import { db } from "@/src/db";
import { mentorGoogleConnections } from "@/src/db/schema/tables/mentor-google-connections";
import { and, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "4herfrika <hello@4herfrika.org>";

type ReconnectNoticeSendResult = {
	data?: { id?: string } | null;
	error?: unknown | null;
};

export async function sendClaimedNoticeOnce(params: {
	claim: () => Promise<boolean>;
	send: () => Promise<ReconnectNoticeSendResult>;
	release: () => Promise<void>;
}): Promise<boolean> {
	if (!(await params.claim())) return false;

	let result: ReconnectNoticeSendResult;
	try {
		result = await params.send();
	} catch {
		await params.release();
		return false;
	}

	if (result.error || !result.data?.id) {
		await params.release();
		return false;
	}

	return true;
}

export async function sendMentorGoogleReconnectNoticeOnce(params: {
	connectionId: string;
	mentorEmail: string;
}): Promise<boolean> {
	const claimedAt = new Date();

	return sendClaimedNoticeOnce({
		claim: async () => {
			const claimed = await db
				.update(mentorGoogleConnections)
				.set({
					reauthorization_notice_sent_at: claimedAt,
					updated_at: claimedAt,
				})
				.where(
					and(
						eq(mentorGoogleConnections.id, params.connectionId),
						isNull(mentorGoogleConnections.reauthorization_notice_sent_at),
					),
				)
				.returning({ id: mentorGoogleConnections.id });
			return claimed.length > 0;
		},

		send: async () => {
			const resend = new Resend(process.env.RESEND_API_KEY);
			return resend.emails.send({
				from: FROM,
				to: params.mentorEmail,
				subject: "Reconnect Google Calendar to keep accepting bookings",
				text: `Hi,

Your Google Calendar connection needs to be reconnected. New mentee bookings can still be hosted by 4HerFrika while you reconnect.

Open your mentor profile to reconnect Google Calendar:
${process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org"}/dashboard/mentor/profile

— 4HerFrika`,
			});
		},

		release: async () => {
			try {
				await db
					.update(mentorGoogleConnections)
					.set({ reauthorization_notice_sent_at: null, updated_at: new Date() })
					.where(
						and(
							eq(mentorGoogleConnections.id, params.connectionId),
							eq(
								mentorGoogleConnections.reauthorization_notice_sent_at,
								claimedAt,
							),
						),
					);
			} catch (error) {
				console.error("[mentor-google-reconnect-notice-release-failed]", {
					errorType: error instanceof Error ? error.name : typeof error,
				});
			}
		},
	});
}
