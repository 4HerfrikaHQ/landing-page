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

export { ActionError };
