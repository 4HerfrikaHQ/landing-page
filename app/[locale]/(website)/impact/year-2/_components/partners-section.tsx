import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ImpactYear2Report } from "../_report";

export async function PartnersSection({
	report,
}: { report: ImpactYear2Report }) {
	if (report.partners.length === 0) {
		return null;
	}

	const t = await getTranslations("impactYear2");

	return (
		<section className="px-4 py-12 lg:px-20">
			<p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
				{t("partnersLabel")}
			</p>
			<ul className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
				{report.partners.map((partner) => (
					<li key={partner.name}>
						<a
							href={partner.url}
							target="_blank"
							rel="noreferrer noopener"
							aria-label={partner.name}
							className="flex aspect-4/3 min-h-11 items-center justify-center rounded-2xl border border-foreground/10 bg-white px-4 py-3 hover:border-primary-500/40"
						>
							<Image
								src={partner.logo}
								alt={partner.name}
								width={200}
								height={120}
								className="max-h-full max-w-full object-contain"
							/>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}
