import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import type { Content } from "@prismicio/client";
import { getTranslations } from "next-intl/server";
import { CampusCard } from "./campus-card";
import { getCampuses } from "../_actions";

export async function OtherCampuses({ currentUid }: { currentUid: string }) {
	const t = await getTranslations("campuses");
	const tc = await getTranslations("common");
	const all = await getCampuses().catch(() => []);
	const others = all.filter((c) => c.uid !== currentUid).slice(0, 3);

	if (others.length === 0) return null;

	return (
		<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
				<FadeIn>
					<div>
						<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
							{t("exploreOtherTitle")}
						</h2>
						<p className="mt-2 text-base md:text-lg text-muted-foreground">
							{t("exploreOtherDescription")}
						</p>
					</div>
				</FadeIn>
				<FadeIn>
					<Button variant="outline" href="/campuses">
						{t("viewAllCampuses")}
					</Button>
				</FadeIn>
			</div>
			<StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{others.map((campus) => (
					<StaggerItem key={campus.id}>
						<CampusCard campus={campus} readMoreLabel={tc("readMore")} />
					</StaggerItem>
				))}
			</StaggerContainer>
		</section>
	);
}
