import { RollLabel } from "@/components/ui/roll-label";
import { Link } from "@/i18n/navigation";
import { CircleAlert, CreditCard } from "lucide-react";
import { getTranslations } from "next-intl/server";
import BankDetails from "../../_components/bank-details";

export async function FailedView({ reference }: { reference: string }) {
	const t = await getTranslations("donate.thanks.failed");
	return (
		<div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-14">
			<div role="alert">
				<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("badge")}
				</span>
				<h1 className="mt-4 text-[38px] font-semibold leading-[1.05] tracking-tight lg:text-[56px]">
					{t("titleFirst")}
					<br />{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("titleSecond")}
					</em>
				</h1>
				<p className="mt-4 max-w-xl text-lg text-muted-foreground">
					{t("text")}
				</p>
				<Link
					href="/donate#give"
					className="press mt-6 inline-flex h-12 items-center rounded-full bg-primary-500 px-8 text-lg font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500"
				>
					<RollLabel>{t("retry")}</RollLabel>
				</Link>
				<h2 className="mt-10 text-lg font-semibold">{t("helpTitle")}</h2>
				<ul className="mt-4 grid gap-4">
					<li className="flex gap-3">
						<CreditCard
							className="mt-0.5 size-5 shrink-0 text-primary-500"
							aria-hidden="true"
						/>
						<div>
							<p className="font-medium">{t("declinedTitle")}</p>
							<p className="text-[15px] text-muted-foreground">
								{t("declinedText")}
							</p>
						</div>
					</li>
					<li className="flex gap-3">
						<CircleAlert
							className="mt-0.5 size-5 shrink-0 text-primary-500"
							aria-hidden="true"
						/>
						<div>
							<p className="font-medium">{t("debitedTitle")}</p>
							<p className="text-[15px] text-muted-foreground">
								{t("debitedText")}{" "}
								<span className="break-all font-mono text-sm">{reference}</span>
							</p>
						</div>
					</li>
				</ul>
			</div>
			<div className="rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:p-8">
				<BankDetails online={false} />
			</div>
		</div>
	);
}
