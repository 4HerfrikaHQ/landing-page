import Image from "next/image";

const Sponsors = () => {
	const sponsors = [
		{ name: "FUSE", logo: "/assets/sponsors/trybefuse.png" },
		{ name: "Beepo", logo: "/assets/sponsors/beepo.png" },
		{ name: "Syncthesis", logo: "/assets/sponsors/syncthesis.png" },
		{ name: "Postman", logo: "/assets/sponsors/postman.png" },
	];

	return (
		<section className="py-10 pb-0 sm:pb-10 my-6 lg:my-8">
			<div className="container mx-auto px-4 sm:px-6">
				<h1 className="text-center text-gray-400 text-2xl sm:text-3xl lg:text-4xl font-bold capitalize tracking-wide mb-6">
					Supported By:
				</h1>
			</div>

			<div className="relative w-full overflow-hidden py-6 sm:py-8">
				<div className="absolute left-0 top-0 h-full w-10 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
				<div className="absolute right-0 top-0 h-full w-10 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

				<div className="flex overflow-x-hidden w-[200%] md:w-auto relative group">
					<div className="animate-marquee whitespace-nowrap min-w-fit group-hover:[animation-play-state:paused]">
						{sponsors.map((sponsor, index) => (
							<span
								key={`first-${index + 1}`}
								className="inline-block mx-2 sm:mx-4 md:mx-6 lg:mx-8"
							>
								<Image
									src={sponsor.logo}
									alt={sponsor.name}
									width={100}
									height={50}
									className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
								/>
							</span>
						))}
					</div>

					<div className="absolute top-0 left-0 animate-marquee2 whitespace-nowrap min-w-fit group-hover:[animation-play-state:paused]">
						{sponsors.map((sponsor, index) => (
							<span
								key={`second-${index + 1}`}
								className="inline-block mx-2 sm:mx-4 md:mx-6 lg:mx-8"
							>
								<Image
									src={sponsor.logo}
									alt={sponsor.name}
									width={100}
									height={50}
									className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
								/>
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Sponsors;
