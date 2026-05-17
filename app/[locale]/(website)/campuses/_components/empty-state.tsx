import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function CampusesEmptyState() {
	const t = await getTranslations("campuses.empty");
	return (
		<section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6">
			<div className="order-2 lg:order-1">
				<p className="text-xs font-medium uppercase tracking-wide text-primary-500 mb-4">
					{t("badge")}
				</p>
				<h2 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-foreground leading-tight">
					{t("title")}
				</h2>
				<p className="mt-5 text-base md:text-lg lg:text-xl text-foreground/60 max-w-xl">
					{t("description")}
				</p>
				<div className="mt-8 flex flex-col sm:flex-row gap-4">
					<Button size="lg" href="/contact-us">
						{t("primaryCta")}
					</Button>
					<Button size="lg" variant="outline" href="/join-us">
						{t("secondaryCta")}
					</Button>
				</div>
			</div>
			<div className="order-1 lg:order-2">
				<div className="relative rounded-[40px] overflow-hidden aspect-[4/3] lg:aspect-[1.1]">
					<Image
						src="/assets/boss-divas.png"
						alt="4Herfrika community"
						fill
						sizes="(min-width: 1024px) 50vw, 100vw"
						className="object-cover"
					/>
				</div>
			</div>
		</section>
	);
}

export function CampusesNoResults({
	query,
	label,
	hint,
}: {
	query: string;
	label: string;
	hint: string;
}) {
	return (
		<div className="rounded-[20px] border border-dashed border-[#E0E0E0] bg-white px-6 py-12 text-center">
			<p className="text-lg text-foreground font-semibold">
				{label.replace("{query}", query)}
			</p>
			<p className="text-sm text-[#999999] mt-1">{hint}</p>
		</div>
	);
}
