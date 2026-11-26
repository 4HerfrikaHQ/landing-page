import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import Image, { type StaticImageData } from "next/image";
import missionImage from "../assets/mission.jpg";
import visionImage from "../assets/vision.jpg";
import { SectionEyebrow } from "./section-eyebrow";

const tags = ["tagMentorship", "tagNetworks", "tagResources"] as const;

function StatementCard({
	image,
	alt,
	title,
	description,
	children,
	delay,
}: {
	image: StaticImageData;
	alt: string;
	title: string;
	description: string;
	children?: React.ReactNode;
	delay: number;
}) {
	return (
		<FadeIn delay={delay} className="flex">
			<article className="flex w-full flex-col rounded-2xl bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:rounded-[40px] lg:p-6">
				<Image
					src={image}
					alt={alt}
					sizes="(max-width: 1024px) 100vw, 560px"
					className="aspect-2/1 w-full rounded-xl object-cover lg:rounded-[20px]"
				/>
				<div className="flex flex-1 flex-col p-2 pt-5 lg:p-4">
					<h3 className="text-xl font-semibold">{title}</h3>
					<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground lg:text-lg">
						{description}
					</p>
					{children}
				</div>
			</article>
		</FadeIn>
	);
}

export async function AboutStatements() {
	const t = await getTranslations("about");
	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn className="max-w-2xl">
					<SectionEyebrow>{t("whyEyebrow")}</SectionEyebrow>
					<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
						{t("whyFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("whySecond")}
						</em>
					</h2>
				</FadeIn>
				<div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-8">
					<StatementCard
						image={missionImage}
						alt={t("missionImageAlt")}
						title={t("missionTitle")}
						description={t("missionDescription")}
						delay={0}
					>
						<ul className="mt-auto flex flex-wrap gap-2 pt-5 text-sm font-medium">
							{tags.map((tag) => (
								<li
									key={tag}
									className="rounded-pill bg-surface-pink px-3 py-1.5 text-primary-500"
								>
									{t(tag)}
								</li>
							))}
						</ul>
					</StatementCard>
					<StatementCard
						image={visionImage}
						alt={t("visionImageAlt")}
						title={t("visionTitle")}
						description={t("visionDescription")}
						delay={0.1}
					/>
				</div>
			</div>
		</section>
	);
}
