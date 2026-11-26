import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

const ONLINE_FAQ = ["receipt", "monthly", "stop", "abroad", "safe"] as const;
const OFFLINE_FAQ = [
	"receiptOffline",
	"monthlyOffline",
	"abroadOffline",
] as const;

export async function DonateFaq({ online }: { online: boolean }) {
	const t = await getTranslations("donate.faq");
	const keys = online ? ONLINE_FAQ : OFFLINE_FAQ;
	return (
		<section className="bg-surface-indigo px-4 py-14 lg:px-20 lg:py-24">
			<div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.6fr]">
				<div>
					<h2 className="text-[32px] font-bold leading-tight lg:text-5xl">
						{t("titleFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("titleSecond")}
						</em>
					</h2>
					<p className="mt-3 text-[17px] text-muted-foreground">
						{t.rich("ask", {
							link: (chunks) => (
								<Link
									href="/contact-us"
									className="font-medium text-primary-500 underline underline-offset-4"
								>
									{chunks}
								</Link>
							),
						})}
					</p>
				</div>
				<div className="grid gap-3">
					{keys.map((key, index) => (
						<details
							key={key}
							open={index === 0}
							className="group rounded-[20px] bg-white p-5"
						>
							<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg text-[17px] font-semibold outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-500">
								{t(`items.${key}.q`)}
								<Plus
									className="size-5 shrink-0 text-primary-500 transition-transform group-open:rotate-45 motion-reduce:transition-none"
									aria-hidden="true"
								/>
							</summary>
							<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
								{t(`items.${key}.a`)}
							</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
