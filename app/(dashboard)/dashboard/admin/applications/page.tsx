import { PageHeader } from "@/components/dashboard/page-header";
import { currentDbUser } from "@/src/auth";
import { MentorApplicationStatus } from "@/src/db/schema/tables/mentor-applications";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getApplications } from "./_actions";
import { ApplicationsTable } from "./_components/applications-table";

const PAGE_SIZE = 20;

export default async function ApplicationsPage({
	searchParams,
}: {
	searchParams: Promise<{
		status?: string;
		q?: string;
		sort?: string;
		page?: string;
	}>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const status = MentorApplicationStatus.catch("pending").parse(sp.status);
	const page = Math.max(1, Number(sp.page) || 1);

	const { rows, total, pendingCount } = await getApplications({
		status,
		query: sp.q,
		sort: sp.sort,
		page,
		pageSize: PAGE_SIZE,
	});

	return (
		<div>
			<PageHeader
				title="Mentor applications"
				subtitle="Review and approve new mentor signups."
			/>
			<Suspense>
				<ApplicationsTable
					rows={rows}
					status={status}
					pendingCount={pendingCount}
					page={page}
					pageSize={PAGE_SIZE}
					total={total}
				/>
			</Suspense>
		</div>
	);
}
