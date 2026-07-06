import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { contentType, generateOGImage, size } from "../../_lib/og";

export { size, contentType };

export default async function Image({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.manageBooking" });
	return generateOGImage(t("title"), t("description"));
}
