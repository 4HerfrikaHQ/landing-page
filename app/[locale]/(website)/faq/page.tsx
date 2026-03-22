import FAQ from "@/app/[locale]/(website)/(home)/_components/faq-section";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { Search } from "lucide-react";
import Image from "next/image";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getFaqPage } from "./_actions";

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("faq");
	const page = await getFaqPage();

	return (
		<>
			<div className="faqbg lg:pb-24 md:pb-16 pb-14 relative">
				{page.data.header_image.url && (
					<Image
						src={page.data.header_image.url}
						alt={page.data.header_image.alt || "FAQ Header Image"}
						className="absolute top-0 left-0 w-full h-full object-cover brightness-50"
						width={500}
						height={500}
					/>
				)}
				<FadeIn>
				<div className="mx-auto max-w-7xl px-4 pb-6 pt-16  sm:px-6 lg:px-8 relative">
					<div className="text-center text-white">
						<h2 className="text-[32px] leading-10 ">{t("title")}</h2>
						<h1 className="lg:text-[64px] text-4xl leading-20 mt-1 font-bold md:text-6xl">
							{t("askAnything")}
						</h1>
						<p className="font-medium lg:text-2xl text-base md:mt-8 mt-2 lg:mb-21 mb-7 md:mb-15 md:text-xl ">
							{t("description")}
						</p>
						<div className="flex justify-center mx-auto items-center bg-background rounded-[8.35px] shadow-md px-4 py-3 w-80 ">
							<Search
								className="h-5.5 w-5.5 text-muted-foreground"
								strokeWidth={2}
							/>

							<input
								type="text"
								placeholder={t("searchPlaceholder")}
								className="ml-2 w-full border-none outline-none bg-transparent text-muted-foreground placeholder-placeholder text-base font-inter"
							/>
						</div>
					</div>
				</div>
				</FadeIn>
			</div>
			<div className="pt-20">
				{page.data.frequently_asked_questions.map(({ section }) => {
					// graphQuery resolves the content relationship, so data is available at runtime
					const sectionData = (
						section as unknown as {
							data: {
								title: string;
								faq: Array<{ question: string; answer: string }>;
							};
						}
					).data;
					if (!sectionData) return null;
					return (
						<div className="mb-20" key={sectionData.title}>
							<h1 className="md:text-[60px] text-[34px] lg:text-[67px] font-semibold text-center mb-8">
								{sectionData.title.split(" ").map((word: string) => (
									<span key={word}>
										<span className="text-primary-500">{word[0]}</span>
										<span>{word.slice(1)}</span>{" "}
									</span>
								))}
							</h1>
							<StaggerContainer className="grid gap-y-6 w-full px-8 md:px-0 md:w-3/4 mx-auto">
								{sectionData.faq.map((faq) => (
									<StaggerItem key={faq.question}>
										<FAQ
											question={faq.question}
											answer={faq.answer}
										/>
									</StaggerItem>
								))}
							</StaggerContainer>
						</div>
					);
				})}
			</div>
			<FadeIn>
			<div className="md:pt-16 px-8 pb-10">
				<div className="p-8 bg-muted rounded-2xl flex flex-col gap-y-8 md:flex-row md:items-center justify-between">
					<div>
						<h4 className="text-primary-500/60 font-semibold text-2xl mb-2">
							{t("stillHaveQuestions")}
						</h4>
						<p className="text-xl text-primary-500/60">
							{t("cantFindAnswer")}
						</p>
					</div>

					<Button href="mailto:support@4herfrika.org" isExternal size="lg">
						{t("getInTouch")}
					</Button>
				</div>
			</div>
			</FadeIn>
		</>
	);
}
