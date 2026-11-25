import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";

const STEPS = [
	{ title: "step1Title", body: "step1Body" },
	{ title: "step2Title", body: "step2Body" },
	{ title: "step3Title", body: "step3Body" },
] as const;

export async function HowACallWorks() {
	const t = await getTranslations("careers");

	return (
		<section className="bg-muted px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("stepsBadge")}
					</span>
					<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
						{t("stepsFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("stepsSecond")}
						</em>
					</h2>
				</FadeIn>
				<RevealGroup
					as="ol"
					className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6"
				>
					{STEPS.map((step, index) => (
						<li
							key={step.title}
							className="rounded-2xl bg-white p-6 lg:rounded-[20px] lg:p-8"
						>
							<span
								aria-hidden="true"
								className="grid size-11 place-items-center rounded-pill bg-primary-500 font-semibold text-white"
							>
								{index + 1}
							</span>
							<h3 className="mt-5 text-xl font-semibold">{t(step.title)}</h3>
							<p className="mt-2 text-[15px] text-muted-foreground">
								{t(step.body)}
							</p>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
