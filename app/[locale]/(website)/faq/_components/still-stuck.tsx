import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

const CONTACT_EMAIL = "hello@4herfrika.org";

export async function StillStuck() {
	const t = await getTranslations("faq");
	return (
		<section className="px-4 py-14 lg:px-20 lg:py-20">
			<FadeIn className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[20px] bg-surface-pink p-6 lg:grid-cols-[1fr_auto] lg:rounded-[40px] lg:p-12">
				<div>
					<h2 className="text-[32px] font-bold leading-tight lg:text-5xl">
						{t("stuckFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("stuckSecond")}
						</em>
					</h2>
					<p className="mt-3 max-w-xl text-[17px] text-muted-foreground">
						{t("stuckBody")}
					</p>
					<ul className="mt-5 flex flex-col gap-1 text-base sm:flex-row sm:gap-6">
						<li>
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="inline-flex min-h-11 items-center font-medium text-primary-500 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
							>
								{CONTACT_EMAIL}
							</a>
						</li>
					</ul>
				</div>
				<Button
					href="/contact-us"
					size="lg"
					className="h-14 px-8 text-[17px] font-medium"
				>
					{t("getInTouch")}
				</Button>
			</FadeIn>
		</section>
	);
}
