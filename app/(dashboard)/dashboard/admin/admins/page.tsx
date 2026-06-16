import { PageHeader } from "@/components/dashboard/page-header";
import { currentDbUser } from "@/src/auth";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";
import { getAdmins } from "./_actions";
import { AdminsTable } from "./_components/admins-table";
import { CreateAdminSheet } from "./_components/create-admin-sheet";

const PAGE_SIZE = 20;

export default async function AdminsPage({
	searchParams,
}: {
	searchParams: Promise<{ q?: string; page?: string }>;
}) {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const sp = await searchParams;
	const page = Math.max(1, Number(sp.page) || 1);

	const { rows, total } = await getAdmins({
		query: sp.q,
		page,
		pageSize: PAGE_SIZE,
	});

	return (
		<div className="mx-auto max-w-4xl p-6 sm:p-8">
			<PageHeader
				title="Admins"
				subtitle={`${total} total`}
				action={<CreateAdminSheet />}
			/>

			<Suspense>
				<AdminsTable
					admins={rows}
					currentUserId={user.id}
					page={page}
					pageSize={PAGE_SIZE}
					total={total}
				/>
			</Suspense>
		</div>
	);
}
