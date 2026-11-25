import { getTranslations } from "next-intl/server";
import BankDetails from "./bank-details";
import { GivingCard } from "./giving-card";

export async function GiveSection({ online }: { online: boolean }) {
	const t = await getTranslations("donate.give");
	const description = t(online ? "descriptionOnline" : "descriptionOffline");

	return (
		<section id="give" className="px-4 py-14 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<div className="text-center">
					<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("badge")}
					</span>
					<h2 className="mt-4 text-[34px] font-bold leading-tight lg:text-5xl">
						{t("titleFirst")}
						<br className="lg:hidden" />{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("titleSecond")}
						</em>
					</h2>
					<p className="mx-auto mt-3 max-w-xl text-[17px] text-muted-foreground">
						{description}
					</p>
				</div>
				<OnlineLayout online={online} />
			</div>
		</section>
	);
}

function OnlineLayout({ online }: { online: boolean }) {
	if (!online) {
		return (
			<div className="mx-auto mt-10 max-w-2xl rounded-[20px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:mt-12 lg:p-10">
				<BankDetails online={false} />
			</div>
		);
	}
	return (
		<div className="mt-10 grid gap-6 rounded-[20px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:mt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:p-10">
			<GivingCard />
			<div className="border-t border-border pt-6 lg:rounded-[20px] lg:border lg:p-8">
				<BankDetails online />
			</div>
		</div>
	);
}
