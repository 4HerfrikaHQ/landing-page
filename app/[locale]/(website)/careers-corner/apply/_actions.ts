"use server";

import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/src/db";
import { mentorApplications } from "@/src/db/schema/tables/mentor-applications";
import { actionClient, ActionError } from "@/src/lib/safe-action";
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
				phone: parsedInput.phone || null,
				linkedin_url: parsedInput.linkedin_url || null,
				country: parsedInput.country || null,
				position: parsedInput.position,
				bio: parsedInput.bio || null,
				gender: parsedInput.gender ?? null,
				expertise_areas: parsedInput.expertise_areas,
				motivation: parsedInput.motivation,
			})
			.returning({ id: mentorApplications.id });

		await notifyAdminOfApplication({
			applicationId: row.id,
			name: parsedInput.name,
			email: parsedInput.email,
		});

		return { applicationId: row.id };
	});
