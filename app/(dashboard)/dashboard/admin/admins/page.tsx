import { currentDbUser } from "@/src/auth";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { unauthorized } from "next/navigation";
import { getAdmins } from "./_actions";
import { AdminTableRow } from "./_components/admin-table-row";
import { CreateAdminSheet } from "./_components/create-admin-sheet";

export default async function AdminsPage() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	const admins = await getAdmins();

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-semibold text-gray-900">Admins</h1>
					<p className="text-sm text-gray-500 mt-1">{admins.length} total</p>
				</div>
				<CreateAdminSheet />
			</div>

			<div className="border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-gray-50">
							<TableHead className="font-medium text-gray-600">Name</TableHead>
							<TableHead className="font-medium text-gray-600">Email</TableHead>
							<TableHead className="font-medium text-gray-600">Joined</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{admins.length === 0 ? (
							<TableRow>
								<TableCell colSpan={3} className="text-center text-gray-400 py-12">
									No admins yet.
								</TableCell>
							</TableRow>
						) : (
							admins.map((admin) => (
								<AdminTableRow key={admin.id} admin={admin} currentUserId={user.id} />
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
