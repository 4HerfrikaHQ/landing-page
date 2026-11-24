import { useTranslations } from "next-intl";

export function BankTransferHint() {
	const t = useTranslations("donate.flow.failed");
	return (
		<p className="rounded-xl border border-dashed border-border p-4 text-[15px]">
			{t("bankHint")}
		</p>
	);
}
