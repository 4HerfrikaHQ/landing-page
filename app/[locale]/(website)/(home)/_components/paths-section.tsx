import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";
import { PATHS } from "../_schema";
import { SectionHeading } from "./section-heading";

const CARD_CLASSES =
	"group flex w-full flex-col rounded-[20px] p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 lg:w-auto lg:rounded-[20px]";

type CardLinkProps = {
	href: string;
	external: boolean;
	newTabLabel: string;
	className: string;
	children: ReactNode;
};

function CardLink({
	href,
	external,
	newTabLabel,
	className,
	children,
}: CardLinkProps) {
	if (external) {
		return (
			<a href={href} target="_blank" rel="noreferrer" className={className}>
				{children}
				<span className="sr-only">{newTabLabel}</span>
			</a>
		);
	}

	return (
		<Link href={href as never} className={className}>
			{children}
		</Link>
	);
}

export async function PathsSection() {
	const t = await getTranslations("home.paths");

	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<SectionHeading
						eyebrow={t("eyebrow")}
						first={t("titleFirst")}
						second={t("titleSecond")}
						breakLine
						className="max-w-2xl"
					/>
				</FadeIn>
				<RevealGroup
					as="ul"
					className="-mx-4 mt-10 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0"
				>
					{PATHS.map((path) => (
						<li
							key={path.key}
							className="flex w-[78%] shrink-0 snap-start lg:w-auto"
						>
							<CardLink
								href={path.href}
								external={path.external}
								newTabLabel={t("newTab")}
								className={cn(CARD_CLASSES, path.surface)}
							>
								<span className="relative block aspect-4/3 w-full overflow-hidden rounded-2xl">
									<Image
										src={path.image}
										alt={t(`${path.key}.imageAlt`)}
										fill
										sizes="(max-width: 1024px) 78vw, 25vw"
										className="object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
									/>
								</span>
								<h3 className="mt-4 text-xl font-semibold">
									{t(`${path.key}.title`)}
								</h3>
								<p className="mt-1 text-[15px] text-muted-foreground">
									{t(`${path.key}.description`)}
								</p>
								<span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-medium text-primary-500">
									{t(`${path.key}.cta`)}
									<ArrowRight
										aria-hidden="true"
										className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
									/>
								</span>
							</CardLink>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
