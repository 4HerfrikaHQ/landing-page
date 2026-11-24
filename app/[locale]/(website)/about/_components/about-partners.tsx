import { FadeIn } from "@/components/motion";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { sponsors } from "../_schema";

const tileClass =
	"group flex h-20 items-center justify-center rounded-2xl border border-border bg-white px-4 py-3 transition hover:border-primary-500/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:h-24";

const logoClass = "max-h-full max-w-full object-contain";

export async function AboutPartners() {
	const t = await getTranslations("about");
	return (
		<section className="px-4 py-14 lg:px-20 lg:py-20">
			<FadeIn>
				<h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					{t("partnersTitle")}
				</h2>
				<ul className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
					{sponsors.map((sponsor) => (
						<li key={sponsor.name}>
							<PartnerTile
								name={sponsor.name}
								logo={sponsor.logo}
								url={sponsor.url}
							/>
						</li>
					))}
					<li>
						<Link
							href={"/contact-us" as Route}
							className="grid h-20 place-items-center rounded-2xl border-2 border-dashed border-primary-500/40 px-3 text-center font-semibold text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:h-24"
						>
							{t("partnerWithUs")}
						</Link>
					</li>
				</ul>
			</FadeIn>
		</section>
	);
}

function PartnerTile({
	name,
	logo,
	url,
}: {
	name: string;
	logo: string;
	url: string | null;
}) {
	const image = (
		<Image
			src={logo}
			alt={name}
			width={200}
			height={120}
			className={logoClass}
		/>
	);
	if (!url) return <div className={tileClass}>{image}</div>;
	return (
		<a
			href={url}
			target="_blank"
			rel="noreferrer noopener"
			aria-label={name}
			className={tileClass}
		>
			{image}
		</a>
	);
}
