import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { CareersHero } from "./_components/hero";
import MentorForm from "./_components/mentor-form";
import { MentorCard } from "./_components/mentor-modal";
import { COUNSELLING_MENTORS } from "./_schema";

const CareersCorner = () => {
	return (
		<section className="overflow-x-hidden">
			<CareersHero />

			<section className="bg-muted">
				<section className="container mx-auto h-full grid md:grid-cols-2 grid-cols-1 gap-10 items-center py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
					<div className="relative w-full h-150">
						<div className="absolute -bottom-12 -right-10 size-40 rounded-full aspect-square border-50 z-10 border-white" />
						<Image
							src="/assets/careers/Star-2.png"
							alt="star"
							width={300}
							height={400}
							className="absolute -top-6 -left-5 size-12 object-contain animate-pulse"
						/>
						<Image
							src="/assets/careers/Star-1.png"
							alt="star"
							width={300}
							height={400}
							className="absolute -top-6 -right-5 size-12 object-contain animate-pulse"
							style={{ animationDelay: "0.5s" }}
						/>
						<Image
							src="/assets/careers/Star-1.png"
							alt="star"
							width={300}
							height={400}
							className="absolute -bottom-6 -left-5 size-12 object-contain animate-pulse"
							style={{ animationDelay: "1s" }}
						/>
						<Image
							src={"/assets/careers/Adesewa.png"}
							alt="/"
							fill
							className="object-cover object-top shadow-xl"
						/>
					</div>
					<div>
						<h3 className="uppercase text-primary-500 text-lg">
							featured mentor
						</h3>
						<h2 className="text-4xl font-semibold my-3 flex justify-between items-end gap-4 flex-wrap text-foreground">
							Adesewa
							<span className="text-primary-500 text-sm">
								Availability: Everyday, 11am - 7pm
							</span>{" "}
						</h2>
						<p className="text-foreground mb-4 capitalize">
							Product Manager & Product Designer
						</p>

						<p className="text-muted-foreground">
							Adesewa is a growth driven product designer and product manager.
							Over the last 3 years, she has designed, elevated and contributed
							to build products for thousands of users in different sectors like
							Web3, Fintech, Health, Education, Beauty, Logistics, Community and
							Gaming.
						</p>
						<div className="flex flex-col md:flex-row items-center gap-5 my-7 w-full justify-between">
							<Link href={"/" as Route} className="underline text-primary-500">
								{" "}
								Message on Linkedin
							</Link>
							<Button variant="solid" size="lg" className="w-1/2">
								Book a call
							</Button>
						</div>
					</div>
				</section>
			</section>

			<section className="bg-primary-400 bg-opacity-10 py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
				<section className="container mx-auto">
					<h2 className="text-foreground text-4xl text-center font-semibold mb-3">
						Book a career counseling
					</h2>
					<p className="text-center text-muted-foreground">
						You can book a 10 mins call with a mentor for free to ask questions.
					</p>
					<section className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
						{COUNSELLING_MENTORS.map((mentor) => (
							<MentorCard key={mentor.name + mentor.bio} mentor={mentor} />
						))}
					</section>
				</section>
			</section>

			<MentorForm />
		</section>
	);
};

export default CareersCorner;
