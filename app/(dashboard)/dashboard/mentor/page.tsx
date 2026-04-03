import { currentDbUser } from "@/src/auth";

export default async function MentorDashboardPage() {
	const user = await currentDbUser();

	return (
		<div>
			<h1>Mentor Dashboard</h1>
			<p>Welcome, {user.role}</p>
		</div>
	);
}
