import { currentUser } from "@/src/auth";
import { redirect } from "next/navigation";
import { MentorHeader } from "./_components/mentor-header";

export default async function MentorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await currentUser().catch(() => null);
	if (!user) redirect("/dashboard/login");

	return (
		<div className="min-h-screen bg-muted">
			<MentorHeader />
			{children}
		</div>
	);
}
