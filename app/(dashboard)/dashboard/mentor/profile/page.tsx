import { currentDbUser } from "@/src/auth";
import { getMentorProfile } from "../_actions";
import { ProfileForm } from "./_components/profile-form";

export default async function MentorProfilePage() {
	const [user, mentor] = await Promise.all([
		currentDbUser(),
		getMentorProfile(),
	]);

	if (!mentor) {
		return (
			<div className="p-8 max-w-3xl mx-auto">
				<p className="text-sm text-gray-500">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	const firstName = user.name.split(" ")[0];

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">
					Hi, {firstName} 👋
				</h1>
				<p className="text-sm text-gray-500 mt-1">Manage your profile.</p>
			</header>
			<ProfileForm mentor={mentor} />
		</div>
	);
}
