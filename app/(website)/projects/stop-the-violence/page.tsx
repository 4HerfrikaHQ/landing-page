import Image from "next/image";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { ProjectContent } from "../_components/project-content";
import { ProjectHero } from "../_components/project-hero";
import {
	CalendarIcon,
	ClockIcon,
	UserIcon,
} from "../_components/project-icons";
import { RelatedProjects } from "../_components/related-projects";
import { related } from "../data/related-projects";

export default function StopTheViolencePage() {
	return (
		<main className="bg-white">
			<section className="px-4 pt-6 md:pt-6 pb-10 md:pb-20 xl:pb-36">
				<div className="mx-auto max-w-4xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Projects", href: "/projects" },
							{ label: "The ‘StopTheViolence’ Project" },
						]}
					/>

					<ProjectHero
						title="The ‘StopTheViolence’ Project"
						coverSrc="/assets/projects/stop-the-violence.jpg"
						coverAlt="StopTheViolence project poster"
						tags={[
							{
								label: "SDGs 5 & 16",
								color: "border-blue-100 bg-blue-50 text-blue-700",
							},
						]}
						meta={[
							{ icon: UserIcon, label: "Admin" },
							{ icon: CalendarIcon, label: "12 Sep 2024" },
							{ icon: ClockIcon, label: "3 min read" },
						]}
					/>

					<div className="mt-8 md:mt-10 border-t border-gray-100 pt-8">
						<ProjectContent>
							<p>
								Violence has become an all-too-familiar reality for students in
								Nigeria, with incidents ranging from bullying and sexual
								harassment to kidnapping and even shootings frequently reported
								in schools. In the context of this project, however, violence
								refers to actions often initiated by groups of angry students
								seeking recognition or an outlet for their frustrations.
							</p>

							<h2>Understanding the Causes of Violence</h2>
							<p>
								The root causes of inter-secondary school violence are complex
								and multifaceted. These include:
							</p>
							<ul>
								<li>Misinformation</li>
								<li>Ego and power struggles (e.g., seniority disputes)</li>
								<li>Relationship conflicts</li>
								<li>Teacher–student altercations</li>
								<li>Parental influence</li>
								<li>Peer pressure</li>
								<li>Territorial dominance</li>
							</ul>

							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&auto=format&fit=crop&w=1600"
									alt="Students engaged during a workshop"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h2>Project Goals and Approach</h2>
							<p>
								The StopTheViolence project delves into these causes, exploring
								their effects and potential consequences on students&apos;
								lives. It is specifically designed to engage secondary school
								students through workshops and the collaborative stages of a
								film project, including pre-production, production, and
								post-production.
							</p>
							<p>The initiative aims to:</p>
							<ul>
								<li>
									Equip students with constructive outlets to express
									themselves.
								</li>
								<li>Encourage skill development through creative platforms.</li>
								<li>Promote peace and create safer school environments.</li>
							</ul>

							{/* Image before Our Partnerships */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1635606906861-a3ac61bc1c78?w=1600&auto=format&fit=crop&q=75"
									alt="Students and mentors outside a school building"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h3>Our Partnerships</h3>
							<p>
								This project was executed in collaboration with Arafat Oseni,
								the visionary behind the initiative, alongside her team, Lagos
								SDG, and the NYSC. Together, we facilitated a workshop focused
								on the effects of Gender-Based Violence, its various forms, and
								strategies for prevention within schools.
							</p>

							{/* Image before Impact and Outreach */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&auto=format&fit=crop&w=1600"
									alt="Group discussion and teamwork at the school"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h3>Impact and Outreach</h3>
							<p>
								As part of our outreach efforts, we visited Akoka High School in
								Lagos, where we engaged directly with over 700 students. The
								sessions provided valuable knowledge about gender-based violence
								and its legal implications, empowering the students to foster a
								culture of safety and respect in their school community. Through
								the StopTheViolence project, 4Herfrika continues its mission to
								build a generation of young leaders who are informed, empowered,
								and dedicated to creating peaceful environments for learning and
								growth.
							</p>

							{/* Final image */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&auto=format&fit=crop&q=75"
									alt="Large group of students celebrating after the session"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>
						</ProjectContent>
					</div>
				</div>
				<div className="max-w-9xl mx-auto w-full">
					<RelatedProjects projects={related} />
				</div>
			</section>
		</main>
	);
}
