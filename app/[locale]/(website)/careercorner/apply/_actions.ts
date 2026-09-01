"use server";

import { db } from "@/src/db";
import { mentorApplications } from "@/src/db/schema/tables/mentor-applications";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { SubmitApplicationSchema } from "./_schema";

const FROM = "4herfrika <hello@4herfrika.org>";

async function notifyAdminOfApplication(params: {
	applicationId: string;
	name: string;
	email: string;
}) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
	await resend.emails.send({
		from: FROM,
		to: process.env.ADMIN_EMAIL ?? "team@4herfrika.org",
		subject: `New mentor application: ${params.name}`,
		text: `${params.name} (${params.email}) applied to become a mentor.

Review: ${siteUrl}/dashboard/admin/applications`,
	});
}

async function sendApplicantConfirmation(params: { to: string; name: string }) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: FROM,
		to: params.to,
		subject: "We received your 4HerFrika mentor application",
		text: `Hi ${params.name},

Thanks for applying to mentor with 4HerFrika! We've received your application and our team will review it shortly. We'll be in touch by email with the next steps.

— 4HerFrika`,
	});
}

export const submitMentorApplication = actionClient
	.schema(SubmitApplicationSchema)
	.action(async ({ parsedInput }) => {
		const existing = await db
			.select({ id: mentorApplications.id, status: mentorApplications.status })
			.from(mentorApplications)
			.where(eq(mentorApplications.email, parsedInput.email))
			.limit(1);

		if (existing[0]?.status === "pending") {
			throw new ActionError(
				"You already have a pending application — we will be in touch soon.",
			);
		}

		const [row] = await db
			.insert(mentorApplications)
			.values({
				name: parsedInput.name,
				email: parsedInput.email,
				phone: parsedInput.phone,
				linkedin_url: parsedInput.linkedin_url,
				country: parsedInput.country,
				bio: parsedInput.bio,
				industry: parsedInput.industry,
				cv_path: parsedInput.cv_path,
			})
			.returning({ id: mentorApplications.id });

		await notifyAdminOfApplication({
			applicationId: row.id,
			name: parsedInput.name,
			email: parsedInput.email,
		});

		// Best-effort acknowledgement to the applicant — never fails the submission.
		try {
			await sendApplicantConfirmation({
				to: parsedInput.email,
				name: parsedInput.name,
			});
		} catch (err) {
			console.error("[apply] applicant confirmation email failed", err);
		}

		return { applicationId: row.id };
	});
