import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "./section-heading";

const PARAGRAPHS = ["p1", "p2", "p3", "p4", "p5"] as const;

export async function FounderNote() {
	const t = await getTranslations("impactYear2");

	return (
		<section id="note" className="scroll-mt-28 px-4 py-16 lg:px-20 lg:py-24">
			<FadeIn className="mx-auto max-w-3xl">
				<SectionHeading
					pill={t("note.pill")}
					first={t("note.first")}
					second={t("note.second")}
				/>
				<div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground/85">
					{PARAGRAPHS.map((key) => (
						<p key={key}>{t(`note.${key}`)}</p>
					))}
				</div>
				<p className="mt-8 border-l-2 border-primary-500 pl-4">
					<b className="block font-semibold text-secondary-500">
						{t("note.name")}
					</b>
					<span className="text-sm text-muted-foreground">
						{t("note.role")}
					</span>
				</p>
			</FadeIn>
			<FadeIn className="mx-auto mt-16 flex max-w-6xl flex-col gap-6 rounded-[20px] bg-surface-indigo p-6 lg:mt-24 lg:flex-row lg:items-center lg:justify-between lg:rounded-[40px] lg:p-10">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-500">
						{t("previously.label")}
					</p>
					<p className="mt-2 max-w-2xl text-xl font-medium text-secondary-500 lg:text-2xl">
						{t("previously.body")}
					</p>
				</div>
				<Button
					href="/impact/year-1"
					variant="outline"
					size="lg"
					className="min-h-12 shrink-0 px-6 font-medium"
				>
					{t("previously.cta")}
				</Button>
			</FadeIn>
		</section>
	);
}
