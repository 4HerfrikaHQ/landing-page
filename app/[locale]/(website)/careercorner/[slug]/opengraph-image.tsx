import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { contentType, generateCareerCornerOGImage, size } from "../../_lib/og";
import { getMentorBySlug } from "./_actions";

export { size, contentType };

export const alt = "Book a mentorship call on 4Herfrika";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Image({
	params,
}: {
	params: Promise<{ locale: Locale; slug: string }>;
}) {
	const { locale, slug } = await params;
	const [mentor, t] = await Promise.all([
		getMentorBySlug(slug),
		getTranslations({ locale, namespace: "seo.mentorProfile" }),
	]);

	const displayName = mentor?.nickname || mentor?.name || "Your next mentor";

	return generateCareerCornerOGImage({
		title: mentor ? t("title", { name: displayName }) : "Career Corner",
		subtitle: mentor?.position
			? `${mentor.position} · ${t("description", { name: displayName })}`
			: t("description", { name: displayName }),
		mentorImage: mentor?.image ?? undefined,
		mentorName: displayName,
	});
}
