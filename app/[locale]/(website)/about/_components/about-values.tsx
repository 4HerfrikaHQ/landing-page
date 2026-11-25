import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { cn } from "@/utils/cn";
import { getTranslations } from "next-intl/server";
import { type ValueTone, values } from "../_schema";

const toneClasses: Record<ValueTone, { surface: string; accent: string }> = {
	pink: { surface: "bg-surface-pink", accent: "text-primary-500" },
	teal: { surface: "bg-surface-teal", accent: "text-secondary-500" },
	indigo: { surface: "bg-surface-indigo", accent: "text-secondary-500" },
	muted: { surface: "bg-muted", accent: "text-primary-500" },
};

export async function AboutValues() {
	const t = await getTranslations("about");
	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<h2 className="text-center text-[32px] font-bold lg:text-5xl">
						{t("valuesFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("valuesSecond")}
						</em>
					</h2>
				</FadeIn>
				<RevealGroup className="mt-10 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{values.map((value) => (
						<div
							key={value.number}
							className={cn(
								"rounded-2xl p-5 lg:rounded-[20px] lg:p-8",
								toneClasses[value.tone].surface,
							)}
						>
							<p
								className={cn(
									"text-3xl font-semibold",
									toneClasses[value.tone].accent,
								)}
							>
								{value.number}
							</p>
							<h3 className="mt-6 text-lg font-semibold">
								{t(value.titleKey)}
							</h3>
							<p className="mt-1 text-[15px] text-muted-foreground">
								{t(value.descriptionKey)}
							</p>
						</div>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
