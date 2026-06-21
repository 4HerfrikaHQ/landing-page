import { currentUser } from "@/src/auth";
import { AdminHeader } from "./_components/admin-header";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await currentUser();

	return (
		<div className="min-h-screen bg-muted">
			<AdminHeader />
			{/* Shared container: every admin page + its loading skeleton sits at the
			    same width and padding, so navigating between pages never shifts. */}
			<div className="mx-auto w-full max-w-6xl p-6 sm:p-8">{children}</div>
		</div>
	);
}
