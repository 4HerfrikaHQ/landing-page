import { getTranslations } from "next-intl/server";
import { SubscribeFormClient } from "./subscribe-client";

export const SubscribeForm = async () => {
  const t = await getTranslations("footer");

  return (
    <SubscribeFormClient
      label={t("subscribe")}
      placeholder={t("emailPlaceholder")}
      description={t("subscribeDescription")}
    />
  )
}
