import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AcademyPage } from "./_components/academy-page";
import { AcademyTestimonials } from "./_components/academy-testimonials";
import { CourseCatalog } from "./_components/course-catalog";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("academy");
	return { title: t("metaTitle"), description: t("metaDescription") };
}
export default function Page() {
	return (
		<AcademyPage
			catalog={<CourseCatalog />}
			testimonials={<AcademyTestimonials />}
		/>
	);
}
