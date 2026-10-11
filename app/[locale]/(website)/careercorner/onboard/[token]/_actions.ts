"use server";

import { db } from "@/src/db";
import { saveOnboardingAvailability } from "@/src/db/actions/availability";
import { uploadMentorAvatar } from "@/src/db/actions/mentors";
import { actionLinks } from "@/src/db/schema/tables/action-links";
import { availability } from "@/src/db/schema/tables/availability";
import { mentorGoogleConnections } from "@/src/db/schema/tables/mentor-google-connections";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { resolveActionLink } from "@/src/lib/action-links";
import {
	ensureMentorCalendarConnection,
	isMentorCalendarError,
} from "@/src/lib/google-calendar";
import { startMentorGoogleOAuthForOnboarding } from "@/src/lib/mentor-google-oauth";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import {
	and,
	eq,
	exists,
	getTableColumns,
	isNotNull,
	isNull,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
	ActivateOnboardingSchema,
	CompleteOnboardingSchema,
	type OnboardingAvailabilitySlot,
	SaveOnboardingAvailabilitySchema,
} from "./_schema";

function mentorOnboardingPath(token: string, locale?: string) {
	const localePrefix = locale === "fr" || locale === "sw" ? `/${locale}` : "";
	return `${localePrefix}/careercorner/onboard/${encodeURIComponent(token)}?step=calendar`;
}

export async function loadMentorFromToken(token: string) {
	const verified = await resolveActionLink(token, "mentor_onboard");
	if (!verified.ok) {
		if (!("resourceId" in verified)) {
			return { ok: false as const, reason: verified.reason, email: null };
		}
		const [owner] = await db
			.select({ email: users.email })
			.from(mentors)
			.innerJoin(users, eq(users.id, mentors.user_id))
			.where(eq(mentors.id, verified.resourceId))
			.limit(1);
		return {
			ok: false as const,
			reason: verified.reason,
			email: owner?.email ?? null,
		};
	}
	const [mentor] = await db
		.select({
			...getTableColumns(mentors),
			name: users.name,
			email: users.email,
		})
		.from(mentors)
		.innerJoin(users, eq(users.id, mentors.user_id))
		.where(
			and(eq(mentors.id, verified.resourceId), eq(mentors.archived, false)),
		)
		.limit(1);
	if (!mentor)
		return { ok: false as const, reason: "not_found" as const, email: null };

	const slots = await db
		.select()
		.from(availability)
		.where(eq(availability.mentor_id, mentor.id));

	const [connection] = await db
		.select({
			status: mentorGoogleConnections.status,
			reauthorizationState: mentorGoogleConnections.reauthorization_state,
			revocationState: mentorGoogleConnections.revocation_state,
			hasRefreshToken: isNotNull(
				mentorGoogleConnections.refresh_token_ciphertext,
			),
			googleEmail: mentorGoogleConnections.google_email,
			connectedAt: mentorGoogleConnections.connected_at,
		})
		.from(mentorGoogleConnections)
		.where(eq(mentorGoogleConnections.mentor_id, mentor.id))
		.limit(1);

	return {
		ok: true as const,
		mentor,
		availability: slots,
		calendarConnection: connection
			? {
					status:
						connection.status === "revoked"
							? ("revoked" as const)
							: connection.status === "connected" &&
									connection.hasRefreshToken &&
									connection.reauthorizationState === "not_required" &&
									connection.revocationState === "not_pending"
								? ("connected" as const)
								: connection.status === "reauth_required" ||
										connection.reauthorizationState === "required"
									? ("reauth_required" as const)
									: connection.status === "connected" ||
											connection.status === "disconnected"
										? ("disconnected" as const)
										: ("not_connected" as const),
					googleEmail: connection.googleEmail,
					connectedAt: connection.connectedAt?.toISOString() ?? null,
				}
			: {
					status: "not_connected" as const,
					googleEmail: null,
					connectedAt: null,
				},
	};
}

export async function startOnboardingGoogleCalendar(
	token: string,
	locale?: string,
	forceConsent?: boolean,
) {
	const verified = await resolveActionLink(token, "mentor_onboard");
	if (!verified.ok) {
		throw new ActionError(`Invalid link: ${verified.reason}`);
	}

	const [mentor] = await db
		.select({ mentorId: mentors.id, userId: mentors.user_id })
		.from(mentors)
		.where(
			and(eq(mentors.id, verified.resourceId), eq(mentors.archived, false)),
		)
		.limit(1);
	if (!mentor) throw new ActionError("Mentor not found");

	return startMentorGoogleOAuthForOnboarding({
		mentorId: mentor.mentorId,
		userId: mentor.userId,
		returnPath: mentorOnboardingPath(token, locale),
		forceConsent,
	});
}

export async function saveMentorOnboardingAvailability(
	token: string,
	slots: OnboardingAvailabilitySlot[],
	timezone: string,
): Promise<{ error?: string }> {
	const parsed = SaveOnboardingAvailabilitySchema.safeParse({
		token,
		slots,
		timezone,
	});
	if (!parsed.success) {
		return {
			error: parsed.error.issues[0]?.message ?? "Invalid availability.",
		};
	}

	const verified = await resolveActionLink(parsed.data.token, "mentor_onboard");
	if (!verified.ok) {
		return {
			error: `Invalid link: ${verified.reason}`,
		};
	}

	return saveOnboardingAvailability(
		parsed.data.token,
		verified.resourceId,
		parsed.data.slots,
		parsed.data.timezone,
	);
}

export async function uploadOnboardingImage(
	token: string,
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	const verified = await resolveActionLink(token, "mentor_onboard");
	if (!verified.ok) {
		return {
			error: `Invalid link: ${verified.reason}`,
		};
	}

	return uploadMentorAvatar(verified.resourceId, formData);
}

export const saveMentorOnboardingProfile = actionClient
	.schema(CompleteOnboardingSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(
			parsedInput.token,
			"mentor_onboard",
		);
		if (!verified.ok) {
			throw new ActionError(`Invalid link: ${verified.reason}`);
		}

		const mentorId = verified.resourceId;
		const [mentor] = await db
			.select()
			.from(mentors)
			.where(and(eq(mentors.id, mentorId), eq(mentors.archived, false)))
			.limit(1);
		if (!mentor) throw new ActionError("Mentor not found");

		await db
			.update(mentors)
			.set({
				bio: parsedInput.bio,
				nickname: parsedInput.nickname || null,
				image: parsedInput.image || null,
			})
			.where(and(eq(mentors.id, mentorId), eq(mentors.archived, false)));

		revalidatePath(`/careercorner/onboard/${parsedInput.token}`);
		return {};
	});

export const completeMentorOnboarding = actionClient
	.schema(ActivateOnboardingSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(
			parsedInput.token,
			"mentor_onboard",
		);
		if (!verified.ok) {
			throw new ActionError(`Invalid link: ${verified.reason}`);
		}

		const mentorId = verified.resourceId;
		const [mentor] = await db
			.select({
				id: mentors.id,
				slug: mentors.slug,
				bio: mentors.bio,
				email: users.email,
			})
			.from(mentors)
			.innerJoin(users, eq(users.id, mentors.user_id))
			.where(and(eq(mentors.id, mentorId), eq(mentors.archived, false)))
			.limit(1);
		if (!mentor) throw new ActionError("Mentor not found");
		if (!mentor.bio) {
			throw new ActionError("Please save your profile before going live.");
		}

		const existingSlots = await db
			.select({ id: availability.id })
			.from(availability)
			.where(eq(availability.mentor_id, mentorId));
		if (existingSlots.length === 0) {
			throw new ActionError(
				"Please save at least one availability slot before going live.",
			);
		}

		try {
			await ensureMentorCalendarConnection({
				mentorId,
				mentorEmail: mentor.email,
			});
		} catch (error) {
			throw new ActionError(
				isMentorCalendarError(error) && error.code === "reauth_required"
					? "Reconnect Google Calendar before going live."
					: "Connect Google Calendar before going live.",
			);
		}

		const activated = await db.transaction(async (tx) => {
			await tx
				.select({ id: mentorGoogleConnections.id })
				.from(mentorGoogleConnections)
				.where(eq(mentorGoogleConnections.mentor_id, mentorId))
				.for("update")
				.limit(1);

			const activatedMentors = await tx
				.update(mentors)
				.set({ active: true })
				.where(
					and(
						eq(mentors.id, mentorId),
						eq(mentors.active, false),
						eq(mentors.archived, false),
						exists(
							tx
								.select({ id: mentorGoogleConnections.id })
								.from(mentorGoogleConnections)
								.where(
									and(
										eq(mentorGoogleConnections.mentor_id, mentors.id),
										eq(mentorGoogleConnections.status, "connected"),
										isNotNull(mentorGoogleConnections.refresh_token_ciphertext),
										eq(mentorGoogleConnections.revocation_state, "not_pending"),
										eq(
											mentorGoogleConnections.reauthorization_state,
											"not_required",
										),
									),
								)
								.limit(1),
						),
					),
				)
				.returning({ id: mentors.id });
			if (activatedMentors.length > 0) {
				await tx
					.update(actionLinks)
					.set({ used_at: new Date() })
					.where(
						and(
							eq(actionLinks.action, "mentor_onboard"),
							eq(actionLinks.resource_id, mentorId),
							isNull(actionLinks.used_at),
						),
					);
			}
			return activatedMentors;
		});
		if (activated.length === 0) {
			throw new ActionError(
				"Google Calendar is no longer connected. Reconnect before going live.",
			);
		}

		revalidatePath("/careercorner");
		revalidatePath(`/careercorner/${mentor.slug}`);
		return { slug: mentor.slug };
	});
