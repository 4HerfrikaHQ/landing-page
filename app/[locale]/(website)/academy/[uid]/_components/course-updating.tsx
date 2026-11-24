import { Button } from "@/components/ui/button";
import type { Route } from "next";
import { useLocale, useTranslations } from "next-intl";
import { ACADEMY_HOME_PATH, localizedPath } from "../../sign-in/_helpers";

export function CourseUpdating() {
	const t = useTranslations("academy.course");
	const locale = useLocale();
	return (
		<section
			aria-labelledby="updating-title"
			className="flex flex-col items-start gap-3 rounded-3xl bg-amber-50 p-6"
		>
			<h2
				id="updating-title"
				className="text-xl font-semibold text-secondary-500"
			>
				{t("updatingTitle")}
			</h2>
			<p className="text-base text-foreground">{t("updatingBody")}</p>
			<Button
				href={localizedPath(locale, ACADEMY_HOME_PATH) as Route}
				variant="outline"
				size="lg"
				className="min-h-12 text-base md:py-3 md:text-base"
			>
				{t("updatingAction")}
			</Button>
		</section>
	);
}
