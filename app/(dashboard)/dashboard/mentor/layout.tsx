import { currentUserCapabilities } from "@/src/auth";
import { redirect, unauthorized } from "next/navigation";
import { MentorHeader } from "./_components/mentor-header";

export default async function MentorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const capabilities = await currentUserCapabilities().catch(() => null);
	if (!capabilities) redirect("/dashboard/login");
	const { isAdmin, isMentor } = capabilities;
	if (!isMentor) unauthorized();

	return (
		<div className="min-h-screen bg-muted">
			<MentorHeader showAdminPortal={isAdmin} />
			{children}
		</div>
	);
}
