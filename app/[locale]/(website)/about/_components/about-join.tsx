import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { joinOptions } from "../_schema";

const cardClass =
	"block h-full rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:rounded-[32px] lg:p-8";

export async function AboutJoin() {
	const t = await getTranslations("about");
	return (
		<section className="bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<h2 className="text-center text-[32px] font-bold lg:text-5xl">
						{t("joinFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("joinSecond")}
						</em>
					</h2>
				</FadeIn>
				<StaggerContainer className="mt-10 grid gap-4 lg:grid-cols-3">
					{joinOptions.map((option) => (
						<StaggerItem key={option.titleKey}>
							<JoinCard
								href={option.href}
								isExternal={option.isExternal}
								title={t(option.titleKey)}
								description={t(option.descriptionKey)}
								link={t(option.linkKey)}
							/>
						</StaggerItem>
					))}
				</StaggerContainer>
			</div>
		</section>
	);
}

function JoinCard({
	href,
	isExternal,
	title,
	description,
	link,
}: {
	href: string;
	isExternal: boolean;
	title: string;
	description: string;
	link: string;
}) {
	const content = (
		<>
			<h3 className="text-lg font-semibold">{title}</h3>
			<p className="mt-1 text-[15px] text-muted-foreground">{description}</p>
			<span className="mt-4 inline-block font-medium text-primary-500">
				{link} →
			</span>
		</>
	);
	if (isExternal) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noreferrer noopener"
				className={cardClass}
			>
				{content}
			</a>
		);
	}
	return (
		<Link href={href as Route} className={cardClass}>
			{content}
		</Link>
	);
}
