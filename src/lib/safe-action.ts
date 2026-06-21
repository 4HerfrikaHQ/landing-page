import { currentDbUser } from "@/src/auth";
import { createSafeActionClient } from "next-safe-action";

class ActionError extends Error {}

export const actionClient = createSafeActionClient({
	handleServerError(e) {
		if (e instanceof ActionError) return e.message;
		console.error("[action error]", e);
		return "Something went wrong. Please try again.";
	},
});

export const adminAction = actionClient.use(async ({ next }) => {
	let user: Awaited<ReturnType<typeof currentDbUser>>;
	try {
		user = await currentDbUser();
	} catch {
		throw new ActionError("Unauthorized");
	}
	if (user.role !== "super_admin") {
		throw new ActionError("Unauthorized");
	}
	return next({ ctx: user });
});

export const mentorAction = actionClient.use(async ({ next }) => {
	let user: Awaited<ReturnType<typeof currentDbUser>>;
	try {
		user = await currentDbUser();
	} catch {
		throw new ActionError("Unauthorized");
	}
	if (user.role !== "mentor") {
		throw new ActionError("Unauthorized");
	}
	return next({ ctx: user });
});

/**
 * Server-side super_admin guard for plain `"use server"` form actions (the ones
 * that aren't wired through `adminAction`). Throws if the caller isn't a
 * super_admin so privileged mutations can't be reached by a direct POST.
 */
export async function requireSuperAdmin() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") {
		throw new ActionError("Unauthorized");
	}
	return user;
}

export { ActionError };
