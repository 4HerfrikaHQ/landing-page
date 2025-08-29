// app/projects/skillup-with-4herfrika/page.tsx
import Image from "next/image";
import Link from "next/link";
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

export default function SkillUpWith4HerfrikaPage() {
	return (
		<main className="bg-white">
			<section className="px-4 pt-6 md:pt-10 pb-36">
				<div className="mx-auto max-w-4xl">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Projects", href: "/projects" },
							{ label: "SkillUp with 4Herfrika" },
						]}
					/>

					<ProjectHero
						title="SkillUp with 4Herfrika"
						coverSrc="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80"
						coverAlt="Hands-on tech training session"
						tags={[
							{
								label: "Bootcamp",
								color: "border-pink-100 bg-pink-50 text-pink-700",
							},
							{
								label: "Digital Skills",
								color: "border-indigo-100 bg-indigo-50 text-indigo-700",
							},
						]}
						meta={[
							{ icon: UserIcon, label: "4Herfrika + Innovation Hubs" },
							{ icon: CalendarIcon, label: "2024–2025" },
							{ icon: ClockIcon, label: "3 min read" },
						]}
					/>

					<div className="mt-8 md:mt-10 border-t border-gray-100 pt-8">
						<ProjectContent>
							<p>
								SkillUp with 4Herfrika is a series of physical bootcamps hosted
								in partnership with digital innovation hubs located around
								African universities. These bootcamps will offer hands-on
								training in various digital and tech-related fields, targeting
								women in local communities. By focusing on practical, in-demand
								skills, the initiative seeks to enhance employability, foster
								entrepreneurship, and bridge the digital divide.
							</p>

							<h2>Target Audience</h2>
							<p>
								The primary beneficiaries of this initiative are women aged
								18–35 living in communities around African universities. These
								individuals may include:
							</p>
							<ul>
								<li>University students and recent graduates.</li>
								<li>Women seeking to transition into tech careers.</li>
								<li>
									Aspiring entrepreneurs looking to leverage technology in their
									ventures.
								</li>
							</ul>

							{/* Image */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80"
									alt="Participants collaborating during a bootcamp session"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h2>Key Program Areas (Stacks)</h2>

							<h3>Product Management</h3>
							<ul>
								<li>
									Training on managing the lifecycle of digital products, from
									ideation to launch.
								</li>
								<li>
									Focus on Agile methodologies, user research, and product
									strategy.
								</li>
							</ul>

							<h3>Product Design &amp; Graphics Design</h3>
							<ul>
								<li>Skills in UI/UX design, wireframing, and prototyping.</li>
								<li>
									Graphic design principles using tools like Figma, Adobe XD,
									and Canva.
								</li>
							</ul>

							<h3>Web Development</h3>
							<ul>
								<li>Frontend and backend development basics.</li>
								<li>
									Introduction to HTML, CSS, JavaScript, and frameworks like
									React.
								</li>
							</ul>

							<h3>Content Design</h3>
							<ul>
								<li>Strategies for creating engaging digital content.</li>
								<li>
									Tools and techniques for copywriting, storytelling, and
									multimedia content creation.
								</li>
							</ul>

							<h3>Web3 and Blockchain Technologies</h3>
							<ul>
								<li>
									Introduction to decentralized applications, blockchain, and
									smart contracts.
								</li>
								<li>Hands-on experience with Web3 tools and platforms.</li>
							</ul>

							{/* Image before Program Structure (as requested) */}
							<div className="not-prose relative my-6 sm:my-8 h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-gray-200">
								<Image
									src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=80"
									alt="Hands-on coding and project work"
									fill
									sizes="(min-width:768px) 720px, 100vw"
									className="object-cover object-center"
								/>
							</div>

							<h2>Program Structure</h2>
							<p>
								Each bootcamp will be a 12-week immersive experience, featuring:
							</p>
							<ul>
								<li>
									<strong>Interactive Workshops:</strong> Led by experienced
									mentors and industry professionals.
								</li>
								<li>
									<strong>Practical Projects:</strong> Real-world tasks to
									reinforce learning.
								</li>
								<li>
									<strong>Networking Opportunities:</strong> Connect with peers,
									mentors, and potential employers.
								</li>
								<li>
									<strong>Career Guidance:</strong> Portfolios, job-market
									navigation, and starting a tech career.
								</li>
							</ul>
						</ProjectContent>

						{/* CTA */}
						<div className="not-prose mt-10">
							<div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-6 sm:px-6 sm:py-8">
								<div className="flex flex-col sm:flex-row sm:items-center gap-4">
									<h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
										What are you waiting for?
									</h3>
									<div className="sm:ml-auto">
										<Link
											href="/join-us"
											className="inline-flex items-center rounded-xl bg-pink-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/70"
										>
											Join the Waitlist
											<svg
												className="ml-2 h-4 w-4"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d="M7 17L17 7" />
												<path d="M8 7h9v9" />
											</svg>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="max-w-9xl mx-auto w-full">
					<RelatedProjects projects={related} />
				</div>
			</section>
		</main>
	);
}
