import { currentUser } from "@/src/auth";
import { MentorHeader } from "./_components/mentor-header";

export default async function MentorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await currentUser();

	return (
		<div className="min-h-screen bg-gray-50">
			<MentorHeader />
			{children}
		</div>
	);
}
