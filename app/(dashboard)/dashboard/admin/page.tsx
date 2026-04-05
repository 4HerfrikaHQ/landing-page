import { currentDbUser } from "@/src/auth";
import { unauthorized } from "next/navigation";

export default async function AdminDashboardPage() {
	const user = await currentDbUser();
	if (user.role !== "super_admin") unauthorized();

	return (
		<div>
			<h1>Admin Dashboard</h1>
		</div>
	);
}
