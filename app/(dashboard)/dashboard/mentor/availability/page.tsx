import { AvailabilityEditor } from "@/components/availability-editor";
import { getMentorProfile } from "../_actions";

export default async function MentorAvailabilityPage() {
	const mentor = await getMentorProfile();

	if (!mentor) {
		return (
			<div className="p-8 max-w-3xl mx-auto">
				<p className="text-sm text-gray-500">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-3xl mx-auto">
			<header className="mb-8">
				<h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
				<p className="text-sm text-gray-500 mt-1">
					Set the weekly slots mentees can book.
				</p>
			</header>
			<AvailabilityEditor
				mentorId={mentor.id}
				initialSlots={mentor.availability}
			/>
		</div>
	);
}
