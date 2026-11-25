import { PageHeader } from "@/components/dashboard/page-header";
import { currentDbUser } from "@/src/auth";
import { TaskSubmissionStatus } from "@/src/db/schema/tables";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { TasksTable } from "./_components/tasks-table";
import { DEFAULT_QUEUE_STATUS, QUEUE_PAGE_SIZE } from "./_helpers";
import { getTaskQueue } from "./_queries";

export default async function AcademyTasksPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string; page?: string }>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const status = TaskSubmissionStatus.catch(DEFAULT_QUEUE_STATUS).parse(
		sp.status,
	);
	const page = Math.max(1, Number(sp.page) || 1);

	const { rows, total, waiting } = await getTaskQueue({
		status,
		page,
		pageSize: QUEUE_PAGE_SIZE,
	});

	return (
		<div>
			<PageHeader
				title="Academy tasks"
				subtitle="Review learner task submissions. A completed task can finish the course and issue the certificate."
			/>
			<Suspense>
				<TasksTable
					rows={rows}
					status={status}
					waiting={waiting}
					page={page}
					pageSize={QUEUE_PAGE_SIZE}
					total={total}
				/>
			</Suspense>
		</div>
	);
}
