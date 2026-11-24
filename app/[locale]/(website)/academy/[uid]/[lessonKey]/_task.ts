import type { TaskSubmissionStatus } from "@/src/db/schema/tables";

export function canSubmitTask(latest: TaskSubmissionStatus | null): boolean {
	return latest === null || latest === "needs_work";
}
