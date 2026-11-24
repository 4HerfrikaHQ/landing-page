import { FadeIn } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";
import { PATHS } from "../_schema";
import { SectionHeading } from "./section-heading";

const CARD_CLASSES =
	"group flex w-[78%] shrink-0 snap-start flex-col rounded-[28px] p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] outline-none hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 lg:w-auto lg:rounded-[32px]";

type CardLinkProps = {
	href: string;
	external: boolean;
	className: string;
	children: ReactNode;
};

function CardLink({ href, external, className, children }: CardLinkProps) {
	if (external) {
		return (
			<a href={href} target="_blank" rel="noreferrer" className={className}>
				{children}
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
			<FadeIn className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow={t("eyebrow")}
					first={t("titleFirst")}
					second={t("titleSecond")}
					breakLine
					className="max-w-2xl"
				/>
				<ul className="-mx-4 mt-10 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0">
					{PATHS.map((path) => (
						<li key={path.key} className="contents">
							<CardLink
								href={path.href}
								external={path.external}
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
				</ul>
			</FadeIn>
		</section>
	);
}
