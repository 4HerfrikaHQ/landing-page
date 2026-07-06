import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { getMentorProfile } from "../_actions";
import { ProfileForm } from "./_components/profile-form";
import { PublicLinkCard } from "./_components/public-link-card";

export default async function MentorProfilePage() {
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
					title="Your profile"
					subtitle="This is what mentees see on your public mentor page."
				/>
			</FadeIn>
			<FadeIn delay={0.05}>
				<div className="mb-6">
					<PublicLinkCard
						url={`https://4herfrika.org/careers-corner/${mentor.slug}`}
					/>
				</div>
			</FadeIn>
			<FadeIn delay={0.1}>
				<ProfileForm mentor={mentor} />
			</FadeIn>
		</div>
	);
}
