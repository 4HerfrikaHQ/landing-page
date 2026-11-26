import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import Image, { type StaticImageData } from "next/image";
import devfest from "../devfest.jpg";
import girlChildDay from "../girl-child-day.jpg";
import techfiesta from "../techfiesta.jpg";

const MOMENTS: ReadonlyArray<{
	key: "girlChildDay" | "techfiesta" | "devfest";
	photo: StaticImageData;
	focus: string;
}> = [
	{ key: "girlChildDay", photo: girlChildDay, focus: "object-[18%_50%]" },
	{ key: "techfiesta", photo: techfiesta, focus: "object-center" },
	{ key: "devfest", photo: devfest, focus: "object-center" },
];

export async function MomentsSection() {
	const t = await getTranslations("impactYear2.moments");

	return (
		<section className="bg-surface-pink px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<h2 className="text-center text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("first")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("second")}
					</em>
				</h2>
				<ul className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-6">
					{MOMENTS.map((moment, index) => (
						<li key={moment.key}>
							<FadeIn delay={index * 0.08}>
								<figure>
									<Image
										src={moment.photo}
										alt={t(`items.${moment.key}.alt`)}
										placeholder="blur"
										sizes="(min-width: 768px) 33vw, 100vw"
										className={`aspect-4/5 w-full rounded-[20px] object-cover ${moment.focus}`}
									/>
									<figcaption className="mt-3 text-[15px] font-medium text-secondary-500">
										{t(`items.${moment.key}.caption`)}
									</figcaption>
								</figure>
							</FadeIn>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
