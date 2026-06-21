import { AvailabilityEditor } from "@/components/availability-editor";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { getMentorProfile } from "../_actions";

export default async function MentorAvailabilityPage() {
	const mentor = await getMentorProfile();

	if (!mentor) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
				<p className="text-sm text-muted-foreground">
					Your mentor profile hasn't been set up yet. Contact an admin.
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<FadeIn>
				<PageHeader
					title="Availability"
					subtitle="Set the weekly slots mentees can book a call in."
				/>
			</FadeIn>
			<FadeIn delay={0.05}>
				<AvailabilityEditor
					mentorId={mentor.id}
					initialSlots={mentor.availability}
				/>
			</FadeIn>
		</div>
	);
}
