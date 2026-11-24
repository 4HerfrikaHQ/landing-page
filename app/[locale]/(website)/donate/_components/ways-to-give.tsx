import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

const WAYS = [
	{ key: "mentor", href: "/join-us", image: "/assets/donate/mentor.jpg" },
	{ key: "partner", href: "/contact-us", image: "/assets/donate/partner.jpg" },
	{ key: "laptops", href: "/contact-us", image: "/assets/donate/laptops.jpg" },
] as const;

export async function WaysToGive() {
	const t = await getTranslations("donate.ways");
	return (
		<section className="px-4 py-14 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<div className="max-w-2xl">
					<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("badge")}
					</span>
					<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
						{t("titleFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("titleSecond")}
						</em>
					</h2>
				</div>
				<ul className="mt-10 grid gap-5 lg:grid-cols-3">
					{WAYS.map((way) => (
						<li key={way.key} className="flex">
							<Link
								href={way.href}
								className="group flex w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.10)] outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-500"
							>
								<div className="relative aspect-16/10 w-full">
									<Image
										src={way.image}
										alt={t(`${way.key}.alt`)}
										fill
										sizes="(min-width: 1024px) 384px, 100vw"
										className="object-cover"
									/>
								</div>
								<div className="flex flex-1 flex-col p-6">
									<h3 className="text-xl font-semibold">
										{t(`${way.key}.title`)}
									</h3>
									<p className="mt-2 text-[15px] text-muted-foreground">
										{t(`${way.key}.text`)}
									</p>
									<span className="mt-auto pt-5 font-medium text-primary-500 group-hover:underline">
										{t(`${way.key}.cta`)}
									</span>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
