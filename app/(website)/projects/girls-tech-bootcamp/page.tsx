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

export default function GirlsTechBootcampPage() {
	return (
		<main className="bg-white">
			<section className="px-4 pt-6 md:pt-10 pb-36">
				<div className="mx-auto max-w-4xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Projects", href: "/projects" },
							{ label: "GirlsTech Bootcamp" },
						]}
					/>

					<ProjectHero
						title="GirlsTech Bootcamp (LAUTECH)"
						// Placeholder hero (swap whenever you have your own)
						coverSrc="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=80"
						coverAlt="Girls learning digital skills on laptops"
						tags={[
							{
								label: "STEM",
								color: "border-pink-100 bg-pink-50 text-pink-700",
							},
							{
								label: "Digital Skills",
								color: "border-indigo-100 bg-indigo-50 text-indigo-700",
							},
						]}
						meta={[
							{ icon: UserIcon, label: "Campus Team (LAUTECH)" },
							{ icon: CalendarIcon, label: "Oct. 11, 2024" },
							{ icon: ClockIcon, label: "3 min read" },
						]}
					/>

					<div className="mt-8 md:mt-10 border-t border-gray-100 pt-8">
						<ProjectContent>
							<p>
								In many low-income communities, girls face significant barriers
								to accessing technology and acquiring digital skills.
								Recognizing this, 4Herfrika’s LAUTECH campus community organized
								a one-day Girls Tech Bootcamp on the International Day of the
								Girl Child 2024. Held in Ogbomoso, Oyo State, the event
								empowered 50 secondary school girls with essential digital
								skills.
							</p>
							<p>
								Themed{" "}
								<strong>
									“EmpowerHER: Building Digital Skills for the Future,”
								</strong>{" "}
								the boot camp focused on foundational tools like Microsoft
								Office Suite, design, and website development. The goal was to
								bridge the gender gap in technology and inspire young girls to
								pursue careers in STEM, positioning them for success in a
								rapidly digital world.
							</p>

							{/* IMAGE */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80"
									alt="Mentor guiding students during a computer session"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h2>Program Highlights</h2>
							<p>
								The bootcamp featured interactive, hands-on sessions led by
								experienced mentors and trainers. To maximize learning,
								participants were divided into small groups, ensuring
								personalized guidance and active participation. The beneficiary
								schools include:
							</p>
							<ul>
								<li>Lautech International College</li>
								<li>Ogbomoso Girls High School</li>
								<li>Nurudeen Grammar School</li>
								<li>Zoe Schools</li>
							</ul>

							{/* IMAGE */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80"
									alt="Students collaborating on a project with laptops"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h2>Key Outcomes</h2>
							<ul>
								<li>
									<strong>Digital Literacy:</strong> Participants gained
									foundational knowledge of Microsoft Office tools, applying
									them to school projects and personal tasks.
								</li>
								<li>
									<strong>Design Skills:</strong> The girls learned basic design
									concepts and created simple projects using Canva.
								</li>
								<li>
									<strong>Web Development:</strong> Participants were introduced
									to WordPress and successfully created landing pages.
								</li>
								<li>
									<strong>Awareness:</strong> The bootcamp heightened
									participants’ understanding of the importance of digital
									skills in education and future career paths.
								</li>
							</ul>

							{/* IMAGE */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80"
									alt="Group session during the bootcamp"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h2>Inspiring Change</h2>
							<p>
								The EmpowerHER bootcamp was more than a training program—it was
								a platform to spike curiosity and confidence in technology. By
								showing that digital skills are within reach, 4Herfrika aims to
								empower these girls to overcome limitations and drive personal
								and community development.
							</p>

							{/* IMAGE */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80"
									alt="Celebration photo with participants at the end of the bootcamp"
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
