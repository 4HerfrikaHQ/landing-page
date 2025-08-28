import { counsellingMentors } from "@/utils/details";
import Image from "next/image";
import Link from "next/link";
import { CareersHero } from "./_components/hero";
import MentorForm from "./_components/mentor-form";
import MentorDetailsModal, {
	ModalProvider,
	Trigger,
} from "./_components/mentor-modal";

const CareersCorner = () => {
	return (
		<section className="overflow-x-hidden">
			{/* Mentor Details Modal - Client Component */}

			<CareersHero />

			{/* Featured Mentor Section */}
			<section className="bg-neutral-200">
				<section className="container mx-auto h-full grid md:grid-cols-2 grid-cols-1 gap-10 items-center py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
					<div className="relative w-full h-[600px]">
						<div className="absolute -bottom-12 -right-10 size-40 rounded-full aspect-square border-[50px] z-10 border-white" />
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
						<h2 className="text-4xl font-semibold my-3 flex justify-between items-end gap-4 flex-wrap text-gray-400">
							Adesewa
							<span className="text-primary-500 text-sm">
								Availability: Everyday, 11am - 7pm
							</span>{" "}
						</h2>
						<p className="text-gray-400 mb-4 capitalize">
							Product Manager & Product Designer
						</p>

						<p className="text-gray-300">
							Adesewa is a growth driven product designer and product manager.
							Over the last 3 years, she has designed, elevated and contributed
							to build products for thousands of users in different sectors like
							Web3, Fintech, Health, Education, Beauty, Logistics, Community and
							Gaming.
						</p>
						<div className="flex flex-col md:flex-row items-center gap-5 my-7 w-full justify-between">
							<Link href={"/"} className="underline text-primary-500">
								{" "}
								Message on Linkedin
							</Link>
							<button
								type="button"
								className="bg-primary-500 w-1/2 rounded-full py-2 text-white hover:bg-primary-600 transition-colors"
							>
								Book a call
							</button>
						</div>
					</div>
				</section>
			</section>

			{/* Career Counseling Section */}
			<section className="bg-primary-400 bg-opacity-10 py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
				<section className="container mx-auto">
					<h2 className="text-gray-400 text-4xl text-center font-semibold mb-3">
						Book a career counseling
					</h2>
					<p className="text-center text-gray-300">
						You can book a 10 mins call with a mentor for free to ask questions.
					</p>
					<ModalProvider>
						<MentorDetailsModal />
						<section className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
							{counsellingMentors.map((mentor) => (
								<div
									key={mentor.name + mentor.bio}
									className="h-full w-full bg-secondary-500 bg-opacity-20 p-2 rounded-md hover:shadow-lg transition-shadow duration-300"
								>
									<div className="overflow-hidden rounded-md">
										<Image
											src={mentor.image}
											alt={mentor.name}
											width={700}
											height={1000}
											className="hover:scale-105 max-h-[285px] object-cover transition-transform duration-300"
										/>
									</div>
									<p className="text-center text-md mt-3 uppercase font-bold text-white">
										{mentor.name}
									</p>
									<p className="text-white text-xs text-center uppercase">
										{mentor.position}
									</p>
									<Trigger
										mentor={mentor}
										className="bg-primary-500 max-w-36 w-full flex items-center justify-center mx-auto my-7 rounded-full py-2 text-white hover:bg-primary-600 transition-colors"
									>
										Details
									</Trigger>
								</div>
							))}
						</section>
					</ModalProvider>
				</section>
			</section>

			<MentorForm />
		</section>
	);
};

export default CareersCorner;
