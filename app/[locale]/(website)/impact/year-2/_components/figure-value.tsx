import { getTranslations } from "next-intl/server";

export async function FigureValue({ value }: { value: string | null }) {
	if (value === null) {
		const t = await getTranslations("impactYear2");
		return (
			<>
				<span aria-hidden="true" className="text-primary-500/50">
					—
				</span>
				<span className="sr-only">{t("pendingValue")}</span>
			</>
		);
	}

	return <>{value}</>;
}
