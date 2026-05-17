import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function QuickActions() {
	const t = await getTranslations("campuses");
	return (
		<section className="relative overflow-hidden bg-primary-500 text-white">
			<div
				className="absolute -top-32 -left-24 size-96 rounded-full bg-white/10"
				aria-hidden
			/>
			<div
				className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-white/10"
				aria-hidden
			/>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative flex flex-col items-center text-center">
				<FadeIn>
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
						{t("quickActionsTitle")}
					</h2>
				</FadeIn>
				<FadeIn delay={0.1}>
					<p className="mt-4 text-base md:text-lg max-w-2xl text-white/90">
						{t("quickActionsDescription")}
					</p>
				</FadeIn>
				<FadeIn delay={0.15}>
					<div className="mt-8 flex flex-col sm:flex-row gap-4">
						<Button
							size="lg"
							href="/donate"
							className="bg-white text-primary-500 hover:bg-white/90"
						>
							{t("ctaDonate")}
						</Button>
						<Button
							size="lg"
							href="/join-us"
							className="bg-transparent border border-white text-white hover:bg-white/10"
						>
							{t("ctaBecomeMentor")}
						</Button>
						<Button
							size="lg"
							href="/contact-us"
							className="bg-transparent border border-white text-white hover:bg-white/10"
						>
							{t("ctaContact")}
						</Button>
					</div>
				</FadeIn>
			</div>
		</section>
	);
}
