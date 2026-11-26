import { FadeIn } from "@/components/motion";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { SECTION_CLASS } from "./section-heading";

const BRAND_EMAIL = "hello@4herfrika.org";

export function ContactSection() {
	const t = useTranslations("brand.contact");

	return (
		<section aria-labelledby="brand-contact" className={SECTION_CLASS}>
			<FadeIn className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[20px] bg-secondary-500 px-6 py-10 text-white md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
				<div className="max-w-xl">
					<h2
						id="brand-contact"
						className="text-3xl font-bold leading-tight md:text-4xl"
					>
						{t("titleFirst")}{" "}
						<em className="font-playfair font-medium text-primary-bright">
							{t("titleSecond")}
						</em>
					</h2>
					<p className="mt-3 text-base leading-7 text-white/85 md:text-lg">
						{t("text")}
					</p>
				</div>
				<a
					href={`mailto:${BRAND_EMAIL}`}
					className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-7 text-base font-medium text-secondary-500 press hover:bg-surface-pink focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-500 md:self-auto"
				>
					<Mail aria-hidden="true" className="size-5" />
					{BRAND_EMAIL}
				</a>
			</FadeIn>
		</section>
	);
}
