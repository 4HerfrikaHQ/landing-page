import { currentDbUser } from "@/src/auth";
import { getMentorProfile } from "./_actions";
import { MentorProfile } from "./_components/mentor-profile";

export default async function MentorDashboardPage() {
	const [user, mentor] = await Promise.all([currentDbUser(), getMentorProfile()]);

	if (!mentor) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<p className="text-sm text-gray-500">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	return <MentorProfile user={user} mentor={mentor} />;
}
