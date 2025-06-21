import Beepo from "@/app/(website)/(home)/assets/sponsors/beepo.png";
import Postman from "@/app/(website)/(home)/assets/sponsors/postman.png";
import Syncthesis from "@/app/(website)/(home)/assets/sponsors/syncthesis.png";
import Trybefuse from "@/app/(website)/(home)/assets/sponsors/trybefuse.png";
import Image from "next/image";
import React from "react";

const Sponsors = () => {
	const sponsors = [
		{ name: "FUSE", logo: Trybefuse.src },
		{ name: "Beepo", logo: Beepo.src },
		{ name: "Syncthesis", logo: Syncthesis.src },
		{ name: "Postman", logo: Postman.src },
	];

	return (
		<section className="px-5 lg:px-0 py-10 my-6 lg:my-8 container mx-auto relative">
			<h1 className="text-center text-gray-400 text-3xl lg:text-4xl font-bold capitalize tracking-wide mb-3 sm:mb-4 lg:mb-6">
				Supported By:
			</h1>
			<div className="relative overflow-hidden py-8">
				<div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10" />
				<div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10" />

				<div className="relative flex overflow-x-hidden group">
					<div className="animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
						{sponsors.map((sponsor, index) => (
							<span key={`first-${index + 1}`} className="inline-block mx-8">
								<Image
									src={sponsor.logo}
									alt={sponsor.name}
									width={150}
									height={80}
									className="h-12 lg:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
								/>
							</span>
						))}
					</div>

					<div className="absolute top-0 animate-marquee2 whitespace-nowrap group-hover:[animation-play-state:paused]">
						{sponsors.map((sponsor, index) => (
							<span key={`second-${index + 1}`} className="inline-block mx-8">
								<Image
									src={sponsor.logo}
									alt={sponsor.name}
									width={150}
									height={80}
									className="h-12 lg:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
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
