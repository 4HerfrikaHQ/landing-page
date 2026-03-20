import Forherfirka from "@/app/[locale]/(website)/about/assets/iphone-mockup.png";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

const coreValues = [
	{
		bg: "from-purple-200 to-pink-200",
		image: "/assets/about/Empowerment.png",
		alt: "Empowerment icon",
		text: "Empowerment",
	},
	{
		bg: "from-green-200 to-blue-200",
		image: "/assets/about/Growth.png",
		alt: "Community Development icon",
		text: "Community Development",
	},
	{
		bg: "from-blue-200 to-purple-200",
		image: "/assets/about/Leader.png",
		alt: "Leadership icon",
		text: "Leadership",
	},
	{
		bg: "from-orange-200 to-pink-200",
		image: "/assets/about/Conversation.png",
		alt: "Mentorship icon",
		text: "Mentorship",
	},
];

export const OurCore = async () => {
	const t = await getTranslations("about");
	return (
		<section className="bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 w-full py-16 md:py-24 relative overflow-hidden">
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-10 left-6 w-24 h-24 md:w-32 md:h-32 bg-pink-200 rounded-full blur-xl" />
				<div className="absolute bottom-10 right-6 w-28 h-28 md:w-40 md:h-40 bg-purple-200 rounded-full blur-xl" />
				<div className="absolute top-1/2 left-1/4 w-20 h-20 md:w-24 md:h-24 bg-blue-200 rounded-full blur-lg" />
			</div>

			<div className="container mx-auto px-4 relative">
				<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground font-bold text-center mb-12 md:mb-16">
					{t("coreValues")}
				</h1>

				<div className="hidden md:flex justify-center items-center min-h-[600px] lg:min-h-[700px] relative">
					<div className="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] border border-secondary-500/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary-500/2" />
					<div className="w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] border border-secondary-500/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary-500/5" />
					<div className="w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] border border-surface-teal rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary-500/5" />

					<div className="relative z-10 w-44 sm:w-52 md:w-60 lg:w-auto">
						<Image
							src={Forherfirka.src}
							alt="4herfrika iphone mockup"
							height={Forherfirka.height}
							width={Forherfirka.width}
							className="object-contain"
						/>
					</div>

					{[
						"top-8 left-8 xl:left-16",
						"top-8 right-8 xl:right-16",
						"bottom-8 left-8 xl:left-16",
						"bottom-8 right-8 xl:right-16",
					].map((pos, i) => (
						<div key={pos} className={`absolute ${pos}`}>
							<div className="relative">
								<div
									className={`absolute inset-0 w-40 h-40 lg:w-48 lg:h-48 bg-gradient-to-br ${coreValues[i].bg} rounded-full opacity-30 blur-sm transform`}
								/>
								<div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border w-36 lg:w-40 text-center">
									<div className="mb-3">
										<Image
											src={coreValues[i].image}
											alt={coreValues[i].alt}
											width={50}
											height={50}
											className="mx-auto"
										/>
									</div>
									<p className="text-foreground font-medium text-sm lg:text-base">
										{coreValues[i].text}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="flex flex-col md:hidden items-center gap-6">
					{/* <Image
						src={Forherfirka.src}
						alt="4herfrika iphone mockup"
						height={Forherfirka.height}
						width={Forherfirka.width}
						className="w-40 h-auto object-contain mb-6"
					/> */}
					<div className="grid grid-cols-2 gap-10">
						{coreValues.map((card) => (
							<div
								key={card.image}
								className="relative w-full h-full max-w-xs flex flex-col"
							>
								<div
									className={`absolute inset-0 w-full h-full bg-gradient-to-br ${card.bg} rounded-2xl opacity-20 blur-sm`}
								/>
								<div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border text-center h-full flex flex-col">
									<div className="mb-2">
										<Image
											src={card.image}
											alt={card.alt}
											width={40}
											height={40}
											className="mx-auto"
										/>
									</div>
									<p className="text-foreground font-medium text-sm flex-grow">
										{card.text}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};
