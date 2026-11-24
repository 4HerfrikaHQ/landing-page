import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/utils/cn";
import { getTranslations } from "next-intl/server";
import { values } from "../_schema";

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
				<StaggerContainer className="mt-10 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{values.map((value) => (
						<StaggerItem
							key={value.number}
							className={cn(
								"rounded-2xl p-5 lg:rounded-[20px] lg:p-8",
								value.surface,
							)}
						>
							<p className={cn("text-3xl font-semibold", value.accent)}>
								{value.number}
							</p>
							<h3 className="mt-6 text-lg font-semibold">
								{t(value.titleKey)}
							</h3>
							<p className="mt-1 text-[15px] text-muted-foreground">
								{t(value.descriptionKey)}
							</p>
						</StaggerItem>
					))}
				</StaggerContainer>
			</div>
		</section>
	);
}
