import { currentUser } from "@/src/auth";
import { AdminHeader } from "./_components/admin-header";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
  }) {
  await currentUser();

	return (
		<div className="min-h-screen bg-gray-50">
			<AdminHeader />
			{children}
		</div>
	);
}
