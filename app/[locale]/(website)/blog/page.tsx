import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import BlogBody from "./_components/blog-body";
import { GalleryGrid } from "./_components/gallery-grid";

export const metadata: Metadata = {
	title: "The Pink Blog — Stories of Women Leading Change in Africa",
	description:
		"Read inspiring stories, experiences, and insights from women across Africa navigating tech, business, and leadership. A safe space to find your mojo.",
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("blog");
	return (
		<>
			{/* Hero Section */}
			<div className="bg-muted py-12 md:py-16 lg:py-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto w-full lg:mx-0">
						<FadeIn>
							<h2 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
								{t("greeting")}
							</h2>
							<p className="mt-3 text-xl leading-8 text-muted-foreground font-semibold">
								{t("welcome")}{" "}
								<span className="text-primary-500">
									{t("blogName")}
								</span>
							</p>
							<p className="text-xl font-light text-foreground mt-2">
								{t("description")}
							</p>
						</FadeIn>
						<FadeIn delay={0.2}>
							<div className="flex gap-4 mt-6 border border-primary-500 rounded-[20px] items-center px-8">
								<Search
									className="h-5.5 w-5.5 text-muted-foreground"
									strokeWidth={2}
								/>
								<input
									type="text"
									className="py-4 flex-1 rounded-[20px] bg-transparent outline-0"
									placeholder={t("searchPlaceholder")}
								/>
							</div>
						</FadeIn>
						<FadeIn delay={0.3}>
							<Image
								src="/assets/blog-hero.png"
								width={1320}
								height={429}
								alt="blog-img"
								className="mt-16 hidden lg:block"
							/>
						</FadeIn>
					</div>
				</div>
			</div>

			{/* Blog Posts with Category Tabs */}
			<Suspense>
				<BlogBody />
			</Suspense>

			{/* Gallery Section */}
			<GalleryGrid />

			{/* CTA Section */}
			<div className="w-full bg-muted py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto flex flex-col items-center gap-8">
					<p className="text-muted-foreground text-xl font-medium text-center">
						To Partner and Donate to this organization, Please send us a mail. You
						can also make direct donations.
					</p>
					<div className="flex flex-col md:flex-row gap-6">
						<Button variant="outline" size="lg" href="/contact-us">
							Send a Mail
						</Button>
						<Button size="lg" href="/donate">
							Pay Directly
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
