import { Button } from "@base-ui/react"
import { ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server";

export const SubscribeForm = async () => {
  const t = await getTranslations("footer");

  return (<div className="bg-muted/20 p-12 rounded-2xl md:mt-4 lg:-mt-8">
    <p className="font-bold text-white text-2xl">{t("subscribe")}</p>

    <div className="mx-auto mt-4 md:max-w-md sm:ms-0">
      <form className="mt-4">
        <div className="flex flex-row lg:items-start">
          <label htmlFor="email" className="sr-only">
            {t("emailPlaceholder")}
          </label>

          <input
            className="w-full rounded-tl-md rounded-bl-md border-border px-6 py-3 shadow-sm placeholder:text-primary-500/60 focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs"
            type="email"
            placeholder={t("emailPlaceholder")}
          />

          <Button
            className="rounded-br-md rounded-tr-md rounded-tl-none rounded-bl-none bg-primary-500/60 px-8 py-4 font-bold text-white hover:bg-primary-500/65"
            type="submit"
          >
            <ArrowRight className="h-4 w-4 text-white" />
          </Button>
        </div>
        <p className="text-lg text-white/60 mt-2">
          {t("subscribeDescription")}
        </p>
      </form>
    </div>
  </div>)
}
