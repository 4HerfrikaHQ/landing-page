"use server";

import { createHash } from "node:crypto";
import { AccountError, addMentorUser } from "@/src/accounts";
import { db } from "@/src/db";
import { insertDefaultBookingSettings } from "@/src/db/actions/mentors";
import {
	MentorApplicationStatus,
	mentorApplications,
} from "@/src/db/schema/tables/mentor-applications";
import { mentors } from "@/src/db/schema/tables/mentors";
import { sendMentorOnboardingInvite } from "@/src/lib/mentor-onboarding-invite";
import { ActionError, adminAction } from "@/src/lib/safe-action";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { type SQL, and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
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

interface ApplicationFilters {
	status?: string;
	query?: string;
	sort?: string;
	order?: string;
	page?: number;
	pageSize?: number;
}

export async function getApplications(filters: ApplicationFilters) {
	const { page = 1, pageSize = 20 } = filters;

	const status = MentorApplicationStatus.catch("pending").parse(filters.status);

	const conditions: (SQL<unknown> | undefined)[] = [
		eq(mentorApplications.status, status),
	];

	if (filters.query) {
		conditions.push(
			or(
				ilike(mentorApplications.name, `%${filters.query}%`),
				ilike(mentorApplications.email, `%${filters.query}%`),
			),
		);
	}

	const where = and(...conditions);
	const orderBy =
		filters.order === "asc" || filters.sort === "oldest"
			? asc(mentorApplications.created_at)
			: desc(mentorApplications.created_at);

	const [rows, [{ total }], [{ pendingCount }]] = await Promise.all([
		db
			.select()
			.from(mentorApplications)
			.where(where)
			.orderBy(orderBy)
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		db.select({ total: count() }).from(mentorApplications).where(where),
		db
			.select({ pendingCount: count() })
			.from(mentorApplications)
			.where(eq(mentorApplications.status, "pending")),
	]);

	return { rows, total, pendingCount };
}

export type ApplicationRow = Awaited<
	ReturnType<typeof getApplications>
>["rows"][number];

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

		const applicant = await addMentorUser({
			email: app.email,
			name: app.name,
		}).catch((error) => {
			if (error instanceof AccountError) {
				throw new ActionError(
					`Could not create applicant account: ${error.message}`,
				);
			}
			throw error;
		});

		const result = await db.transaction(async (tx) => {
			const [mentor] = await tx
				.insert(mentors)
				.values({
					user_id: applicant.id,
					bio: app.bio,
					linkedin_url: app.linkedin_url,
					slug,
					active: false,
				})
				.returning({ id: mentors.id });

			await insertDefaultBookingSettings(tx, mentor.id);

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

		await sendMentorOnboardingInvite({
			mentorId: result.mentorId,
			to: app.email,
			name: app.name,
			intro: "Your mentor application was approved!",
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

export async function getCvSignedUrl(path: string): Promise<string | null> {
	const admin = createSupabaseAdmin(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
	const { data } = await admin.storage
		.from("mentor-cvs")
		.createSignedUrl(path, 60);
	return data?.signedUrl ?? null;
}
