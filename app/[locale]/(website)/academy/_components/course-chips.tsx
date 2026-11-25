import { useLocale, useTranslations } from "next-intl";
import {
	type Academy,
	COURSE_CONTENT_LOCALE,
	type CourseLevel,
} from "../_schema";

const TRACK_CLASS = "bg-surface-pink text-primary-700";
const LANGUAGE_CLASS = "bg-white text-secondary-500 ring-1 ring-border";
const LEVEL_CLASS = "bg-surface-indigo text-secondary-500";
const CHIP_CLASS =
	"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

export function CourseChips({
	track,
	level,
}: {
	track: Academy;
	level: CourseLevel;
}) {
	const t = useTranslations("academy.catalog");
	return (
		<>
			<span className={`${CHIP_CLASS} ${TRACK_CLASS}`}>
				{t(`tracks.${track}`)}
			</span>
			<span className={`${CHIP_CLASS} ${LEVEL_CLASS}`}>
				{t(`levels.${level}`)}
			</span>
			<ContentLanguageChip />
		</>
	);
}

function ContentLanguageChip() {
	const t = useTranslations("academy.catalog");
	const locale = useLocale();
	if (locale === COURSE_CONTENT_LOCALE) return null;
	return (
		<span className={`${CHIP_CLASS} ${LANGUAGE_CLASS}`}>{t("inEnglish")}</span>
	);
}
