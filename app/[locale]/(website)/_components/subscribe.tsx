import { getTranslations } from "next-intl/server";
import { SubscribeFormClient, type SubscribeTone } from "./subscribe-client";

type SubscribeFormProps = { tone?: SubscribeTone; showCopy?: boolean };

export const SubscribeForm = async ({ tone, showCopy }: SubscribeFormProps) => {
	const t = await getTranslations("footer");

	return (
		<SubscribeFormClient
			tone={tone}
			showCopy={showCopy}
			label={t("newsletterTitle")}
			placeholder={t("emailPlaceholder")}
			description={t("subscribeDescription")}
			submitLabel={t("subscribe")}
			successMessage={t("subscribeSuccess")}
		/>
	);
};
