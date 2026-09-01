"use server";

import { createHash } from "node:crypto";
import { createAdminClient } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import {
	insertDefaultBookingSettings,
	uploadMentorAvatar,
} from "@/src/db/actions/mentors";
import { bookings } from "@/src/db/schema/tables/bookings";
import { CYCLE_MS, SINGLETON_ID } from "@/src/lib/featured-mentor";
import { isUniqueViolation, parseMentorSlug } from "@/src/lib/mentor-slug";
import {
	ActionError,
	adminAction,
	requireSuperAdmin,
} from "@/src/lib/safe-action";
import {
	type SQL,
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	ne,
	or,
	sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
	type MentorSortValue,
	RequestMentorCalendarConnectionSchema,
	SetFeaturedMentorSchema,
} from "./_schema";

interface MentorAdminFilters {
	query?: string;
	status?: "active" | "inactive";
	sort?: MentorSortValue;
	/** When "featured"/"not_featured", filter against the singleton state. */
	featured?: "featured" | "not_featured";
	page?: number;
	pageSize?: number;
}

function mentorPublicUrl(slug: string) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
	return `${siteUrl}/careercorner/${slug}`;
}

/** Sentinel for "these filters can't match any mentor". */
const NO_MATCH = Symbol("no-match");

/**
 * Shared filter translation so the paginated table and the "copy every link"
 * action always agree on which mentors match. Returns NO_MATCH when the filters
 * can't match anything (featured filter with no featured mentor set).
 */
async function mentorFilterWhere({
	query,
	status,
	featured,
}: Pick<MentorAdminFilters, "query" | "status" | "featured">) {
	const conditions: (SQL<unknown> | undefined)[] = [];

	if (query) {
		conditions.push(
			or(
				ilike(schema.users.name, `%${query}%`),
				ilike(schema.mentors.position, `%${query}%`),
			),
		);
	}

	switch (status) {
		case "active":
			conditions.push(eq(schema.mentors.active, true));
			break;
		case "inactive":
			conditions.push(eq(schema.mentors.active, false));
			break;
	}

	// Resolve the featured filter into a SQL condition so pagination stays correct
	// (the singleton featured mentor can't be filtered in-memory after limit/offset).
	if (featured) {
		const featuredId = await getFeaturedMentorId();
		if (featured === "featured") {
			if (!featuredId) return NO_MATCH;
			conditions.push(eq(schema.mentors.id, featuredId));
		} else if (featuredId) {
			conditions.push(ne(schema.mentors.id, featuredId));
		}
	}

	return conditions.length ? and(...conditions) : undefined;
}

export async function getMentorsForAdmin(filters: MentorAdminFilters = {}) {
	await requireSuperAdmin();

	const { sort = "name", page = 1, pageSize = 20 } = filters;

	const where = await mentorFilterWhere(filters);
	if (where === NO_MATCH) return { rows: [], total: 0 };

	const bookingCount = sql<number>`count(${bookings.id})`.as("booking_count");

	const orderBy =
		sort === "joined"
			? desc(schema.mentors.created_at)
			: sort === "bookings"
				? desc(bookingCount)
				: asc(schema.users.name);

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: schema.mentors.id,
				name: schema.users.name,
				slug: schema.mentors.slug,
				position: schema.mentors.position,
				image: schema.mentors.image,
				email: schema.users.email,
				bio: schema.mentors.bio,
				nickname: schema.mentors.nickname,
				linkedin_url: schema.mentors.linkedin_url,
				active: schema.mentors.active,
				google_connection_status: schema.mentorGoogleConnections.status,
				google_reauthorization_state:
					schema.mentorGoogleConnections.reauthorization_state,
				created_at: schema.mentors.created_at,
				booking_count: bookingCount,
			})
			.from(schema.mentors)
			.innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
			.leftJoin(
				schema.mentorGoogleConnections,
				eq(schema.mentorGoogleConnections.mentor_id, schema.mentors.id),
			)
			.leftJoin(bookings, eq(bookings.mentor_id, schema.mentors.id))
			.where(where)
			.groupBy(
				schema.mentors.id,
				schema.users.id,
				schema.mentorGoogleConnections.status,
				schema.mentorGoogleConnections.reauthorization_state,
			)
			.orderBy(orderBy)
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		db
			.select({ total: count() })
			.from(schema.mentors)
			.innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
			.where(where),
	]);

	return {
		rows: rows.map((row) => ({
			...row,
			public_url: mentorPublicUrl(row.slug),
		})),
		total,
	};
}

/**
 * Every mentor matching the current filters, unpaginated — marketing copies the
 * whole set of public links at once instead of page by page.
 */
export async function getMentorLinksForAdmin(
	filters: Pick<MentorAdminFilters, "query" | "status" | "featured"> = {},
) {
	await requireSuperAdmin();

	const where = await mentorFilterWhere(filters);
	if (where === NO_MATCH) return [];

	const rows = await db
		.select({ name: schema.users.name, slug: schema.mentors.slug })
		.from(schema.mentors)
		.innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
		.where(and(where, eq(schema.mentors.active, true)))
		.orderBy(asc(schema.users.name));

	return rows.map(({ name, slug }) => ({
		name,
		url: mentorPublicUrl(slug),
	}));
}

export type AdminMentorRow = Awaited<
	ReturnType<typeof getMentorsForAdmin>
>["rows"][number];

export async function createMentor(
	formData: FormData,
): Promise<{ error?: string }> {
	await requireSuperAdmin();

	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const position = (formData.get("position") as string) || "";
	const bio = (formData.get("bio") as string) || undefined;
	const nickname = (formData.get("nickname") as string) || undefined;
	const linkedin_url = (formData.get("linkedin_url") as string) || undefined;

	const supabase = await createAdminClient();
	const { data, error } = await supabase.auth.admin.createUser({
		email,
		email_confirm: true,
		user_metadata: { name },
	});
	if (error) return { error: error.message };

	const dbUser = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, data.user.id))
		.limit(1)
		.then((rows) => rows[0]);

	if (!dbUser) return { error: "User record not found after creation." };

	const baseSlug =
		(nickname || name)
			.toLowerCase()
			.normalize("NFKD")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "") || "mentor";
	const suffix = createHash("sha256")
		.update(`${Date.now()}-${baseSlug}`)
		.digest("hex")
		.slice(0, 8);
	const slug = `${baseSlug}-${suffix}`;

	const [mentor] = await db
		.insert(schema.mentors)
		.values({
			user_id: dbUser.id,
			position,
			bio,
			nickname,
			linkedin_url,
			slug,
		})
		.returning({ id: schema.mentors.id });

	await insertDefaultBookingSettings(db, mentor.id);

	revalidatePath("/dashboard/admin/mentors");
	return {};
}

export async function updateMentor(
	id: string,
	formData: FormData,
): Promise<{ error?: string }> {
	await requireSuperAdmin();

	const name = formData.get("name") as string;
	const position = (formData.get("position") as string) || "";
	const bio = (formData.get("bio") as string) || undefined;
	const nickname = (formData.get("nickname") as string) || undefined;
	const linkedin_url = (formData.get("linkedin_url") as string) || undefined;
	const parsedSlug = parseMentorSlug(formData.get("slug"));
	if (!parsedSlug.success) return { error: parsedSlug.error };
	const currentMentor = await db.query.mentors.findFirst({
		where: eq(schema.mentors.id, id),
		columns: { slug: true },
	});
	if (!currentMentor) return { error: "Mentor not found." };
	const slugChanged = parsedSlug.slug !== currentMentor.slug;
	if (slugChanged) {
		const recentlyUsed = await db.query.mentors.findFirst({
			where: and(
				eq(schema.mentors.previous_slug, parsedSlug.slug),
				ne(schema.mentors.id, id),
			),
			columns: { id: true },
		});
		if (recentlyUsed) return { error: "This profile link is already taken." };
	}

	// Name lives on the user row; the rest on the mentor row. One transaction
	// so both land together.
	try {
		await db.transaction(async (tx) => {
			const [row] = await tx
				.update(schema.mentors)
				.set({
					position,
					bio,
					nickname,
					linkedin_url,
					slug: parsedSlug.slug,
					previous_slug: slugChanged ? currentMentor.slug : undefined,
				})
				.where(eq(schema.mentors.id, id))
				.returning({ userId: schema.mentors.user_id });

			if (row) {
				await tx
					.update(schema.users)
					.set({ name })
					.where(eq(schema.users.id, row.userId));
			}
		});
	} catch (error) {
		if (isUniqueViolation(error)) {
			return { error: "This profile link is already taken." };
		}
		throw error;
	}

	revalidatePath("/dashboard/admin/mentors");
	revalidatePath(`/careercorner/${parsedSlug.slug}`);
	return {};
}

export async function uploadMentorImage(
	mentorId: string,
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	await requireSuperAdmin();

	const result = await uploadMentorAvatar(mentorId, formData);
	if (!result.error) revalidatePath("/dashboard/admin/mentors");
	return result;
}

export async function toggleMentorActive(
	id: string,
	active: boolean,
): Promise<{ error?: string }> {
	await requireSuperAdmin();

	if (active) {
		const mentor = await db.query.mentors.findFirst({
			where: eq(schema.mentors.id, id),
			with: { availability: true },
		});

		if (!mentor) {
			return { error: "Mentor not found" };
		}

		const parsedSlug = parseMentorSlug(mentor.slug);
		if (!parsedSlug.success) {
			return {
				error: `Cannot activate mentor. ${parsedSlug.error}`,
			};
		}

		// name is guaranteed (users.name is NOT NULL); only mentor-owned fields
		// can be missing.
		if (!mentor.position || !mentor.bio) {
			return {
				error:
					"Cannot activate mentor. Please ensure position and bio are both set.",
			};
		}
	}

	await db
		.update(schema.mentors)
		.set({ active })
		.where(eq(schema.mentors.id, id));

	revalidatePath("/dashboard/admin/mentors");
	return {};
}

export async function getFeaturedMentorId(): Promise<string | null> {
	const [state] = await db
		.select({
			featured_mentor_id: schema.featuredMentorState.featured_mentor_id,
		})
		.from(schema.featuredMentorState)
		.where(eq(schema.featuredMentorState.id, SINGLETON_ID))
		.limit(1);
	return state?.featured_mentor_id ?? null;
}

export const setFeaturedMentor = adminAction
	.schema(SetFeaturedMentorSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await db.query.mentors.findFirst({
			where: eq(schema.mentors.id, parsedInput.mentorId),
		});

		if (!mentor || !mentor.active || !mentor.image) {
			throw new ActionError(
				"Mentor must be active and have a profile photo to be featured",
			);
		}

		const now = new Date();

		await db.transaction(async (tx) => {
			const [state] = await tx
				.select()
				.from(schema.featuredMentorState)
				.where(eq(schema.featuredMentorState.id, SINGLETON_ID))
				.for("update")
				.limit(1);

			if (!state) {
				throw new ActionError(
					"featured_mentor_state singleton row is missing; run db:migrate to apply the seed migration.",
				);
			}

			const windowOpen = !!state.cycle_end_at && now < state.cycle_end_at;

			await tx
				.update(schema.featuredMentorState)
				.set({
					featured_mentor_id: parsedInput.mentorId,
					is_manual_override: true,
					cycle_start_at: windowOpen ? state.cycle_start_at : now,
					cycle_end_at: windowOpen
						? state.cycle_end_at
						: new Date(now.getTime() + CYCLE_MS),
					updated_at: now,
				})
				.where(eq(schema.featuredMentorState.id, SINGLETON_ID));
		});

		revalidatePath("/careercorner");
		revalidatePath("/dashboard/admin/mentors");
		return { ok: true };
	});

export const requestMentorCalendarConnection = adminAction
	.schema(RequestMentorCalendarConnectionSchema)
	.action(async ({ parsedInput }) => {
		const [mentor] = await db
			.select({ email: schema.users.email, name: schema.users.name })
			.from(schema.mentors)
			.innerJoin(schema.users, eq(schema.users.id, schema.mentors.user_id))
			.where(eq(schema.mentors.id, parsedInput.mentorId))
			.limit(1);

		if (!mentor?.email) {
			throw new ActionError("That mentor has no email on file.");
		}

		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
		const firstName = mentor.name?.split(" ")[0] ?? "there";

		const resend = new Resend(process.env.RESEND_API_KEY);
		const { error } = await resend.emails.send({
			from: "4herfrika <hello@4herfrika.org>",
			to: mentor.email,
			subject: "Connect your Google Calendar to host mentee calls",
			text: `Hi ${firstName},

To host mentee calls on your own Google Calendar and Meet, connect your Google
account from your mentor profile:

${siteUrl}/dashboard/mentor/profile

Sign in with the Google account you want your calls organised from, and approve
the Calendar permission.

— 4HerFrika`,
		});

		if (error) {
			console.error("[mentor-calendar-connect-request-failed]", {
				mentorId: parsedInput.mentorId,
				errorType: error.name,
			});
			throw new ActionError("The email could not be sent. Try again.");
		}

		return { sentTo: mentor.email };
	});
