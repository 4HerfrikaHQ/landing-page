import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import BankDetails from "./_components/bank-details";

export default async function DonationPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("donate");

	return (
		<div className="min-h-screen bg-background">
			<section className="py-12 sm:py-14 md:py-16 px-4 bg-muted">
				<div className="max-w-7xl mx-auto relative">
					<FadeIn>
					<div className="text-center mb-10 sm:mb-12 md:mb-16">
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground md:text-foreground mb-6 sm:mb-8 leading-tight">
							{t("heroTitle")}
							<br />
							<span className="text-foreground">{t("heroOrg")}</span>
						</h1>
						<p className="text-base sm:text-lg md:text-2xl text-foreground max-w-4xl mx-auto leading-relaxed">
							{t("heroVision")}
						</p>
					</div>
					</FadeIn>

					<StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 items-center">
						<StaggerItem className="relative">
							<div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transform sm:rotate-1 md:rotate-3 hover:rotate-0 transition-transform duration-300">
								<Image
									src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&auto=format&fit=crop&q=75"
									alt="African children smiling"
									width={1200}
									height={800}
									className="w-full h-56 xs:h-64 sm:h-80 md:h-96 object-cover"
									priority
								/>
							</div>
						</StaggerItem>
						<StaggerItem className="relative">
							<div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl isolation-isolate">
								<Image
									src="https://images.unsplash.com/photo-1710093072228-8c3129f27357?w=1200&auto=format&fit=crop&q=75"
									alt="African women in technology"
									width={1200}
									height={800}
									className="w-full h-48 sm:h-60 md:h-72 object-cover"
								/>
								<div className="absolute inset-0 bg-black/60 sm:bg-black/70 z-10" />
								<div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center text-white p-5 sm:p-6 md:p-8">
									<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
										{t("donateToEmpower")}
									</h2>
									<Link
										href="#bank-details"
										scroll={true}
										className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 sm:py-4 px-8 sm:px-12 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
										aria-label={t("donateNow")}
									>
										{t("donateNow")}
									</Link>
								</div>
							</div>
						</StaggerItem>
						<StaggerItem className="relative">
							<div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transform -sm:rotate-1 md:-rotate-3 hover:rotate-0 transition-transform duration-300">
								<Image
									src="https://images.unsplash.com/photo-1554796104-5c39d0551b52?w=1200&auto=format&fit=crop&q=75"
									alt="African woman with flowers"
									width={1200}
									height={800}
									className="w-full h-56 xs:h-64 sm:h-80 md:h-96 object-cover"
								/>
							</div>
						</StaggerItem>
					</StaggerContainer>
				</div>
			</section>

			<section
				id="bank-details"
				className="py-14 sm:py-16 md:py-20 px-4 border-t border-border bg-background"
			>
				<FadeIn>
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-8 sm:mb-10 md:mb-12">
						<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
							{t("helpEmpower")}
						</h2>
						<p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
							{t("helpDescription")}
						</p>
					</div>
					<BankDetails />
				</div>
				</FadeIn>
			</section>
		</div>
	);
}
