import Image from "next/image";
import UnderlineSquiggle from "../underline-squiggle";

const SPONSORS = [
	{ name: "Postman", logo: "/assets/sponsors/postman.png", url: "https://postman.com" },
	{ name: "Google Developer Student Clubs", logo: "/assets/sponsors/google-developer-student-clubs.png", url: "https://gdsc.community.dev" },
	{ name: "Enactus", logo: "/assets/sponsors/enactus.png", url: "https://enactus.org" },
	{ name: "FATE Foundation", logo: "/assets/sponsors/fate-foundation.jpg", url: "https://fatefoundation.org" },
	{ name: "Beepo", logo: "/assets/sponsors/beepo.png", url: "#" },
	{ name: "Syncthesis", logo: "/assets/sponsors/syncthesis.jpg", url: "#" },
	{ name: "TechAff", logo: "/assets/sponsors/techaff.jpg", url: "#" },
	{ name: "Trybeby FUSE", logo: "/assets/sponsors/trybeby-fuse.jpg", url: "#" },
	{ name: "Lagos SDGs Youth Alliance", logo: "/assets/sponsors/lagos-sdgs-youth-alliance.png", url: "#" },
	{ name: "The Growth Hub", logo: "/assets/sponsors/the-growth-hub.jpg", url: "#" },
];

export function Sponsors() {
	return (
		<section className="pt-16 pb-24 md:pt-24 md:pb-40 px-4 md:px-22.5 flex flex-col items-center">
			<h2 className="text-4xl md:text-[68px] text-foreground font-semibold mb-4 text-center">
				Our Sponsors
			</h2>
			<UnderlineSquiggle width={220} className="mb-10 md:mb-14" />

			<div className="w-full max-w-5xl grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
				{SPONSORS.map((sponsor) => (
					<a
						key={sponsor.name}
						href={sponsor.url}
						target="_blank"
						rel="noreferrer noopener"
						aria-label={sponsor.name}
						className="group flex aspect-[4/3] items-center justify-center rounded-2xl border border-foreground/10 bg-white px-4 py-3 transition hover:border-primary-500/40 hover:shadow-md"
					>
						<Image
							src={sponsor.logo}
							alt={sponsor.name}
							width={200}
							height={120}
							className="max-h-full max-w-full object-contain transition group-hover:scale-105"
						/>
					</a>
				))}
			</div>
		</section>
	);
}
