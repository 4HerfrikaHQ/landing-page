"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { db } from "@/src/db";
import { mentorApplications } from "@/src/db/schema/tables/mentor-applications";
import { mentors } from "@/src/db/schema/tables/mentors";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { adminAction, ActionError } from "@/src/lib/safe-action";
import { signBookingToken } from "@/src/lib/booking-tokens";
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
		let slug = baseSlug;
		let n = 1;
		while (true) {
			const exists = await db
				.select({ id: mentors.id })
				.from(mentors)
				.where(eq(mentors.slug, slug))
				.limit(1);
			if (exists.length === 0) break;
			n += 1;
			slug = `${baseSlug}-${n}`;
		}

		const result = await db.transaction(async (tx) => {
			const [mentor] = await tx
				.insert(mentors)
				.values({
					user_id: ctx.user.id,
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
					reviewed_by: ctx.user.id,
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
				reviewed_by: ctx.user.id,
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
