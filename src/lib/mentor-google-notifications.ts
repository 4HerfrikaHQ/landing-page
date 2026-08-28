import { db } from "@/src/db";
import { mentorGoogleConnections } from "@/src/db/schema/tables/mentor-google-connections";
import { and, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "4herfrika <hello@4herfrika.org>";

type ReconnectNoticeSendResult = {
	data?: { id?: string } | null;
	error?: unknown | null;
};

export async function sendReconnectNoticeOnce(params: {
	sentAt: Date | null | undefined;
	send: () => Promise<ReconnectNoticeSendResult>;
	markSent: () => Promise<void>;
}): Promise<boolean> {
	if (params.sentAt) return false;
	const result = await params.send();
	if (result.error || !result.data?.id) return false;
	await params.markSent();
	return true;
}

export async function sendMentorGoogleReconnectNoticeOnce(params: {
	connectionId: string;
	mentorEmail: string;
}): Promise<boolean> {
	return db.transaction(async (tx) => {
		const [connection] = await tx
			.select({
				noticeSentAt: mentorGoogleConnections.reauthorization_notice_sent_at,
			})
			.from(mentorGoogleConnections)
			.where(eq(mentorGoogleConnections.id, params.connectionId))
			.for("update");
		if (!connection || connection.noticeSentAt) return false;

		return sendReconnectNoticeOnce({
			sentAt: connection.noticeSentAt,
			send: async () => {
				try {
					const resend = new Resend(process.env.RESEND_API_KEY);
					return await resend.emails.send({
						from: FROM,
						to: params.mentorEmail,
						subject: "Reconnect Google Calendar to keep accepting bookings",
						text: `Hi,

Your Google Calendar connection needs to be reconnected. New mentee bookings are paused until you reconnect Google Calendar.

Open your mentor profile to reconnect Google Calendar:
${process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org"}/dashboard/mentor/profile

— 4HerFrika`,
					});
				} catch (error) {
					console.error("[mentor-google-reconnect-notice-failed]", {
						errorType: error instanceof Error ? error.name : typeof error,
					});
					throw error;
				}
			},
			markSent: async () => {
				await tx
					.update(mentorGoogleConnections)
					.set({
						reauthorization_notice_sent_at: new Date(),
						updated_at: new Date(),
					})
					.where(
						and(
							eq(mentorGoogleConnections.id, params.connectionId),
							isNull(mentorGoogleConnections.reauthorization_notice_sent_at),
						),
					);
			},
		}).catch(() => false);
	});
}
