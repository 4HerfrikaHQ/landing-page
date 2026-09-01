import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { contentType, generateCareerCornerOGImage, size } from "../_lib/og";
import { getHeroMentors } from "./_actions";

export { size, contentType };

export const alt = "Find a mentor in the 4Herfrika Career Corner";
export const dynamic = "force-dynamic";

export default async function Image({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.careers" });
	const mentors = await getHeroMentors();
	return generateCareerCornerOGImage({
		title: t("ogTitle"),
		subtitle: t("ogSubtitle"),
		mentors,
	});
}
