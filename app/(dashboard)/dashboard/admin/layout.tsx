import { AdminHeader } from "./_components/admin-header";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50">
			<AdminHeader />
			{children}
		</div>
	);
}
