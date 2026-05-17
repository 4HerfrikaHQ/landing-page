import { unauthorized } from "next/navigation";
import { currentDbUser } from "@/src/auth";
import { listMentorApplications } from "./_actions";
import { ApplicationsTable } from "./_components/applications-table";

export default async function ApplicationsPage() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const rows = await listMentorApplications();

	return (
		<div className="p-8 max-w-5xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">
					Mentor applications
				</h1>
				<p className="text-sm text-gray-500 mt-1">
					Review and approve new mentor signups.
				</p>
			</header>
			<ApplicationsTable rows={rows} />
		</div>
	);
}
