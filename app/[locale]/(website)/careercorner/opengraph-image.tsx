import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getHeroMentors } from "./_actions";
import {
	contentType,
	generateCareerCornerOGImage,
	size,
} from "../_lib/og";

export { size, contentType };

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
