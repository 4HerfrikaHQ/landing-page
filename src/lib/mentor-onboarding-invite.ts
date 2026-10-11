import { createActionLink } from "@/src/lib/action-links";
import { Resend } from "resend";

const FROM = "4herfrika <hello@4herfrika.org>";
const ONBOARDING_LINK_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export async function sendMentorOnboardingInvite(params: {
	mentorId: string;
	to: string;
	name: string;
	intro: string;
}) {
	const token = await createActionLink({
		resourceId: params.mentorId,
		action: "mentor_onboard",
		expiresAt: new Date(Date.now() + ONBOARDING_LINK_LIFETIME_MS),
	});
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
	const url = `${siteUrl}/careercorner/onboard/${token}`;
	const resend = new Resend(process.env.RESEND_API_KEY);
	const { error } = await resend.emails.send({
		from: FROM,
		to: params.to,
		subject: "Welcome to 4HerFrika — finish setting up your mentor profile",
		text: `Hi ${params.name},

${params.intro} Finish your profile, set your availability, and connect Google Calendar here:
${url}

This link expires in 30 days and only works once.

After you've finished setting up, sign in anytime at:
${siteUrl}/dashboard/login
Enter this email address and we'll send you a 6-digit code. No password needed.

— 4HerFrika`,
	});

	if (error) throw new Error(error.message);
}
