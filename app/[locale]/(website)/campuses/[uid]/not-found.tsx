import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import UnderlineSquiggle from "../../about/underline-squiggle";

export default async function CampusNotFound() {
	const t = await getTranslations("campuses.notFound");

	return (
		<main className="bg-background">
			<section className="bg-muted py-20 md:py-28 lg:py-32">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
					<FadeIn>
						<h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
							{t("title")}
						</h1>
					</FadeIn>
					<UnderlineSquiggle width={220} className="mt-4 mb-6" />
					<FadeIn delay={0.1}>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
							{t("description")}
						</p>
					</FadeIn>
					<FadeIn delay={0.15}>
						<p className="mt-4 text-base md:text-lg text-foreground font-medium max-w-2xl">
							{t("invite")}
						</p>
					</FadeIn>
					<FadeIn delay={0.2}>
						<div className="mt-10 flex flex-col sm:flex-row gap-4">
							<Button size="lg" href="/contact-us">
								{t("contactCta")}
							</Button>
							<Button size="lg" variant="outline" href="/campuses">
								{t("browseCta")}
							</Button>
						</div>
					</FadeIn>
				</div>
			</section>
		</main>
	);
}
