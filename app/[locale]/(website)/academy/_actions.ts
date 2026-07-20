"use server";

import { db } from "@/src/db";
import { academyWaitlistEntries } from "@/src/db/schema/tables";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { Resend } from "resend";
import { AcademyWaitlistSchema } from "./_schema";

const FROM = "4herfrika <hello@4herfrika.org>";
const academyNames = { tech: "Tech", business: "Business", climate: "Climate" };

export const joinAcademyWaitlist = actionClient
	.schema(AcademyWaitlistSchema)
	.action(async ({ parsedInput }) => {
		const [entry] = await db.insert(academyWaitlistEntries).values(parsedInput).onConflictDoNothing().returning({ id: academyWaitlistEntries.id });
		if (!entry) throw new ActionError("You’re already on this academy’s waitlist.");
		const resend = new Resend(process.env.RESEND_API_KEY);
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
		try {
			await resend.emails.send({ from: FROM, to: process.env.ADMIN_EMAIL ?? "team@4herfrika.org", subject: `New ${academyNames[parsedInput.academy]} Academy waitlist signup`, text: `${parsedInput.name} (${parsedInput.email}) joined the ${academyNames[parsedInput.academy]} Academy waitlist.\n\nView entries: ${siteUrl}/dashboard/admin/academy-waitlist` });
			await resend.emails.send({ from: FROM, to: parsedInput.email, subject: "You’re on the 4Herfrika Academy waitlist", text: `Hi ${parsedInput.name},\n\nThanks for joining the ${academyNames[parsedInput.academy]} Academy waitlist. We’ll let you know when enrollment opens.\n\n— 4Herfrika` });
		} catch (error) { console.error("[academy-waitlist] email failed", error); }
		return { id: entry.id };
	});
