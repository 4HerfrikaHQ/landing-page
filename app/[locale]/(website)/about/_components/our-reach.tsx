import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { getTranslations } from "next-intl/server";
import { Statistic } from "../../_components/statistic";

export const OurReach = async () => {
	const t = await getTranslations("about");
	const client = createClient();
	const page = await client.getSingle<Content.HomepageDocument>("homepage");
	const { members, campuses, countries } = page.data;

	return (
		<section className="px-4 md:px-28 container mx-auto py-10 pb-16 lg:py-20">
			<FadeIn>
				<h1 className="text-3xl md:text-4xl font-semibold text-center">
					{t.rich("weHaveReached", {
						pink: (chunks) => <span className="text-primary-500">{chunks}</span>,
					})}
				</h1>
			</FadeIn>
			<StaggerContainer className="mt-10 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 z-10 relative">
				<StaggerItem>
					<Statistic value={members} label={t("members")} />
				</StaggerItem>
				<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
				<StaggerItem>
					<Statistic value={campuses} label={t("campuses")} />
				</StaggerItem>
				<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
				<StaggerItem>
					<Statistic value={countries} label={t("africanCountries")} />
				</StaggerItem>
			</StaggerContainer>
		</section>
	);
};
