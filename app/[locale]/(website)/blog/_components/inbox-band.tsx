import { getTranslations } from "next-intl/server";
import { SubscribeForm } from "../../_components/subscribe";

export async function InboxBand() {
	const t = await getTranslations("blogPage");

	return (
		<section className="rounded-t-[40px] bg-surface-pink px-4 py-14 lg:rounded-t-[64px] lg:px-20 lg:py-20">
			<div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:items-center">
				<div>
					<h2 className="text-[30px] font-bold leading-tight lg:text-[44px]">
						{t("inboxTitle")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("inboxEm")}
						</em>
					</h2>
					<p className="mt-3 text-[15px] text-muted-foreground lg:text-lg">
						{t("inboxDescription")}
					</p>
				</div>
				<SubscribeForm tone="light" showCopy={false} />
			</div>
		</section>
	);
}
