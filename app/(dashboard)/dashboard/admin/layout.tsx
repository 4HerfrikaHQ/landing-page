import { currentUserCapabilities } from "@/src/auth";
import { unauthorized } from "next/navigation";
import { AdminHeader } from "./_components/admin-header";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAdmin, isMentor } = await currentUserCapabilities();
	if (!isAdmin) unauthorized();

	return (
		<div className="min-h-screen bg-muted">
			<AdminHeader showMentorPortal={isMentor} />
			{/* Shared container: every admin page + its loading skeleton sits at the
			    same width and padding, so navigating between pages never shifts. */}
			<div className="mx-auto w-full max-w-6xl p-6 sm:p-8">{children}</div>
		</div>
	);
}
