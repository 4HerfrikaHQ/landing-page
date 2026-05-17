import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function CampusNotFound() {
	const t = await getTranslations("campuses.notFound");

	return (
		<main className="bg-background">
			<section
				className="-mt-16 lg:-mt-[90px] pt-16 lg:pt-[90px] flex flex-col items-center justify-center text-center px-4 min-h-[580px]"
				style={{
					background:
						"linear-gradient(180deg, rgba(236,0,140,0.18) 0%, rgba(236,0,140,0.08) 45%, rgba(255,255,255,1) 85%)",
				}}
			>
				<div className="max-w-3xl mx-auto flex flex-col items-center gap-6 mt-16">
					<h1 className="text-4xl lg:text-[56px] font-bold leading-[1.1] text-foreground">
						{t("title")}
					</h1>
					<p className="text-lg lg:text-2xl text-foreground/60 max-w-2xl">
						{t("description")}
					</p>
					<p className="text-base lg:text-lg text-foreground/80 max-w-2xl">
						{t("invite")}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 mt-2">
						<Button size="lg" href="/contact-us">
							{t("contactCta")}
						</Button>
						<Button size="lg" variant="outline" href="/campuses">
							{t("browseCta")}
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}
