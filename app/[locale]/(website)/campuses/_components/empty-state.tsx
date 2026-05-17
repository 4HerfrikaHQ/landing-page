import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function CampusesEmptyState() {
	const t = await getTranslations("campuses.empty");
	return (
		<section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6">
			<FadeIn direction="right" className="order-2 lg:order-1">
				<p className="text-xs font-semibold tracking-wider text-primary-500 uppercase mb-4">
					{t("badge")}
				</p>
				<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
					{t("title")}
				</h2>
				<p className="mt-5 text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl">
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
			</FadeIn>
			<FadeIn direction="left" className="order-1 lg:order-2">
				<div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-[1.1]">
					<Image
						src="/assets/boss-divas.png"
						alt="4Herfrika community"
						fill
						sizes="(min-width: 1024px) 50vw, 100vw"
						className="object-cover"
					/>
				</div>
			</FadeIn>
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
		<div className="rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-12 text-center">
			<p className="text-lg text-foreground font-semibold">
				{label.replace("{query}", query)}
			</p>
			<p className="text-sm text-muted-foreground mt-1">{hint}</p>
		</div>
	);
}
