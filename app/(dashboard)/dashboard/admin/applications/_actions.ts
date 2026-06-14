"use server";

import { createHash } from "node:crypto";
import { createClient } from "@/src/auth";
import { db } from "@/src/db";
import { mentorApplications } from "@/src/db/schema/tables/mentor-applications";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { signBookingToken } from "@/src/lib/booking-tokens";
import { ActionError, adminAction } from "@/src/lib/safe-action";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { ApproveApplicationSchema, RejectApplicationSchema } from "./_schema";

const FROM = "4herfrika <hello@4herfrika.org>";

function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

async function sendApprovalEmail(params: {
	to: string;
	name: string;
	onboardToken: string;
}) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
	const url = `${siteUrl}/careers-corner/onboard/${params.onboardToken}`;
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: FROM,
		to: params.to,
		subject: "Welcome to 4HerFrika — finish setting up your mentor profile",
		text: `Hi ${params.name},

Your mentor application was approved! Finish your profile and set your availability here:
${url}

This link expires in 30 days.

— 4HerFrika`,
	});
}

async function sendRejectionEmail(params: {
	to: string;
	name: string;
	reason?: string;
}) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: FROM,
		to: params.to,
		subject: "Update on your 4HerFrika mentor application",
		text: `Hi ${params.name},

Thank you for applying. We're unable to move forward at this time.${params.reason ? `\n\n${params.reason}` : ""}

— 4HerFrika`,
	});
}

async function resolveApplicantUser(params: { email: string; name: string }) {
	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, params.email))
		.limit(1)
		.then((rows) => rows[0] ?? null);
	if (existing) return existing.id;

	const supabase = await createClient();
	const { data, error } = await supabase.auth.admin.createUser({
		email: params.email,
		email_confirm: true,
		user_metadata: { name: params.name },
	});

	if (error) {
		// Auth user may already exist even though no public.users row was found
		// above (e.g. the row was deleted, or a race). Fall back to the row the
		// signup trigger creates so we never strand the applicant.
		const fallback = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, params.email))
			.limit(1)
			.then((rows) => rows[0] ?? null);
		if (fallback) return fallback.id;
		throw new ActionError(`Could not create applicant account: ${error.message}`);
	}

	const dbUser = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.auth_user_id, data.user.id))
		.limit(1)
		.then((rows) => rows[0] ?? null);
	if (!dbUser) throw new ActionError("User record not found after creation.");
	return dbUser.id;
}

export async function listMentorApplications() {
	return db
		.select()
		.from(mentorApplications)
		.orderBy(desc(mentorApplications.created_at));
}

export const approveMentorApplication = adminAction
	.schema(ApproveApplicationSchema)
	.action(async ({ parsedInput, ctx }) => {
		const [app] = await db
			.select()
			.from(mentorApplications)
			.where(eq(mentorApplications.id, parsedInput.applicationId))
			.limit(1);
		if (!app) throw new ActionError("Application not found");
		if (app.status !== "pending")
			throw new ActionError("Application is not pending");

		const baseSlug = slugify(app.name);
		const suffix = createHash("sha256")
			.update(`${Date.now()}-${baseSlug}`)
			.digest("hex")
			.slice(0, 8);
		const slug = `${baseSlug}-${suffix}`;

		const applicantUserId = await resolveApplicantUser({
			email: app.email,
			name: app.name,
		});

		const result = await db.transaction(async (tx) => {
			const [mentor] = await tx
				.insert(mentors)
				.values({
					user_id: applicantUserId,
					name: app.name,
					position: app.position,
					bio: app.bio,
					linkedin_url: app.linkedin_url,
					slug,
					active: false,
				})
				.returning({ id: mentors.id });

			await tx.insert(mentorBookingSettings).values({ mentor_id: mentor.id });

			await tx
				.update(mentorApplications)
				.set({
					status: "approved",
					reviewed_at: new Date(),
					reviewed_by: ctx.id,
					mentor_id: mentor.id,
				})
				.where(eq(mentorApplications.id, app.id));

			return { mentorId: mentor.id };
		});

		const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
		const token = signBookingToken({
			bookingId: result.mentorId,
			action: "mentor_onboard",
			expiresAt,
		});
		await sendApprovalEmail({
			to: app.email,
			name: app.name,
			onboardToken: token,
		});

		revalidatePath("/dashboard/admin/applications");
		return { mentorId: result.mentorId };
	});

export const rejectMentorApplication = adminAction
	.schema(RejectApplicationSchema)
	.action(async ({ parsedInput, ctx }) => {
		const [app] = await db
			.select()
			.from(mentorApplications)
			.where(eq(mentorApplications.id, parsedInput.applicationId))
			.limit(1);
		if (!app) throw new ActionError("Application not found");
		if (app.status !== "pending")
			throw new ActionError("Application is not pending");

		await db
			.update(mentorApplications)
			.set({
				status: "rejected",
				reject_reason: parsedInput.reason ?? null,
				reviewed_at: new Date(),
				reviewed_by: ctx.id,
			})
			.where(eq(mentorApplications.id, app.id));

		await sendRejectionEmail({
			to: app.email,
			name: app.name,
			reason: parsedInput.reason,
		});

		revalidatePath("/dashboard/admin/applications");
		return { ok: true };
	});
