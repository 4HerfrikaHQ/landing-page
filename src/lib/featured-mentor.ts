import { db, schema } from "@/src/db";
import type {
	DbFeaturedMentorState,
	DbMentorWithAvailability,
} from "@/src/db/schema/tables";
import { eq, and } from "drizzle-orm";

export const CYCLE_MS = 3 * 24 * 60 * 60 * 1000;
export const SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

function isEligible(mentor: {
	active: boolean;
	image: string | null;
}): boolean {
	return mentor.active === true && !!mentor.image;
}

function shuffle<T>(input: T[]): T[] {
	const arr = [...input];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

async function getEligibleMentors(): Promise<DbMentorWithAvailability[]> {
	const all = await db.query.mentors.findMany({
		where: eq(schema.mentors.active, true),
		with: { availability: true },
	});
	return all.filter(isEligible);
}

function findMentor(
	pool: DbMentorWithAvailability[],
	id: string | null,
): DbMentorWithAvailability | null {
	if (!id) return null;
	return pool.find((m) => m.id === id) ?? null;
}

export async function resolveFeaturedMentor(): Promise<DbMentorWithAvailability | null> {
	const now = new Date();

	const [state] = await db
		.select()
		.from(schema.featuredMentorState)
		.where(eq(schema.featuredMentorState.id, SINGLETON_ID))
		.limit(1);

	if (
		state &&
		state.cycle_end_at &&
		now < state.cycle_end_at &&
		state.featured_mentor_id
	) {
		const current = await db.query.mentors.findFirst({
			where: and(
				eq(schema.mentors.id, state.featured_mentor_id),
				eq(schema.mentors.active, true),
			),
			with: { availability: true },
		});
		if (current && isEligible(current)) return current;
	}

	return resolveLocked(now);
}

async function resolveLocked(
	now: Date,
): Promise<DbMentorWithAvailability | null> {
	return db.transaction(async (tx) => {
		const [state] = await tx
			.select()
			.from(schema.featuredMentorState)
			.where(eq(schema.featuredMentorState.id, SINGLETON_ID))
			.for("update")
			.limit(1);

		if (!state) {
			throw new Error(
				"featured_mentor_state singleton row is missing; run db:migrate to apply the seed migration.",
			);
		}

		const pool = await getEligibleMentors();
		const poolIds = new Set(pool.map((m) => m.id));

		const windowExpired = !state.cycle_end_at || now >= state.cycle_end_at;
		const currentMentor = findMentor(pool, state.featured_mentor_id);

		if (windowExpired) {
			return advanceCycle(tx, state, pool, poolIds, now);
		}

		if (!currentMentor) {
			return fallbackWithinWindow(tx, state, pool, poolIds);
		}

		return currentMentor;
	});
}

async function advanceCycle(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	state: DbFeaturedMentorState,
	pool: DbMentorWithAvailability[],
	poolIds: Set<string>,
	now: Date,
): Promise<DbMentorWithAvailability | null> {
	if (pool.length === 0) {
		await tx
			.update(schema.featuredMentorState)
			.set({
				featured_mentor_id: null,
				is_manual_override: false,
				cycle_start_at: now,
				cycle_end_at: new Date(now.getTime() + CYCLE_MS),
				updated_at: now,
			})
			.where(eq(schema.featuredMentorState.id, SINGLETON_ID));
		return null;
	}

	let featuredThisCycle = state.featured_this_cycle.filter((id) =>
		poolIds.has(id),
	);
	let rotationOrder = state.rotation_order.filter((id) => poolIds.has(id));

	const featuredSet = new Set(featuredThisCycle);
	let remaining = pool.map((m) => m.id).filter((id) => !featuredSet.has(id));

	if (remaining.length === 0) {
		rotationOrder = shuffle(pool.map((m) => m.id));
		featuredThisCycle = [];
		remaining = [...rotationOrder];
	}

	const remainingSet = new Set(remaining);
	const pickId =
		rotationOrder.find((id) => remainingSet.has(id)) ?? remaining[0];

	featuredThisCycle = [...featuredThisCycle, pickId];

	await tx
		.update(schema.featuredMentorState)
		.set({
			featured_mentor_id: pickId,
			is_manual_override: false,
			rotation_order: rotationOrder,
			featured_this_cycle: featuredThisCycle,
			cycle_start_at: now,
			cycle_end_at: new Date(now.getTime() + CYCLE_MS),
			updated_at: now,
		})
		.where(eq(schema.featuredMentorState.id, SINGLETON_ID));

	return findMentor(pool, pickId);
}

async function fallbackWithinWindow(
	tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
	state: DbFeaturedMentorState,
	pool: DbMentorWithAvailability[],
	poolIds: Set<string>,
): Promise<DbMentorWithAvailability | null> {
	if (pool.length === 0) {
		await tx
			.update(schema.featuredMentorState)
			.set({ featured_mentor_id: null, updated_at: new Date() })
			.where(eq(schema.featuredMentorState.id, SINGLETON_ID));
		return null;
	}

	const featuredSet = new Set(
		state.featured_this_cycle.filter((id) => poolIds.has(id)),
	);
	const replacement =
		pool.find((m) => !featuredSet.has(m.id)) ?? pool[0];

	await tx
		.update(schema.featuredMentorState)
		.set({ featured_mentor_id: replacement.id, updated_at: new Date() })
		.where(eq(schema.featuredMentorState.id, SINGLETON_ID));

	return replacement;
}
