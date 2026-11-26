import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SOCIAL_LINKS } from "../../_components/footer";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../../navigation";

const DETAIL_ROW_STYLES =
	"flex min-h-12 items-center gap-3 text-base outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md";
const ICON_BUBBLE_STYLES =
	"inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-pink text-primary-500";

export async function DirectDetails() {
	const t = await getTranslations("contact");

	return (
		<aside className="rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] ring-1 ring-border lg:sticky lg:top-28 lg:p-8">
			<h2 className="text-xl font-semibold">{t("directTitle")}</h2>
			<ul className="mt-5 flex flex-col gap-2">
				<li>
					<a href={`mailto:${CONTACT_EMAIL}`} className={DETAIL_ROW_STYLES}>
						<span className={ICON_BUBBLE_STYLES}>
							<Mail className="size-5" aria-hidden="true" />
						</span>
						<span className="min-w-0 break-words">{CONTACT_EMAIL}</span>
					</a>
				</li>
				<li>
					<a href={CONTACT_PHONE.href} className={DETAIL_ROW_STYLES}>
						<span className={ICON_BUBBLE_STYLES}>
							<Phone className="size-5" aria-hidden="true" />
						</span>
						{CONTACT_PHONE.display}
					</a>
				</li>
				<li className="flex min-h-12 items-center gap-3 text-base">
					<span className={ICON_BUBBLE_STYLES}>
						<MapPin className="size-5" aria-hidden="true" />
					</span>
					{t("region")}
				</li>
			</ul>
			<ul
				aria-label={t("socialLabel")}
				className="mt-5 flex gap-2 border-t border-border pt-5"
			>
				{SOCIAL_LINKS.map(({ name, href, Icon }) => (
					<li key={name}>
						<a
							href={href}
							target="_blank"
							rel="noreferrer"
							aria-label={`${name} (${t("opensInNewTab")})`}
							className="inline-flex size-12 items-center justify-center rounded-full bg-surface-pink text-primary-500 outline-none transition-colors hover:bg-primary-500 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500"
						>
							<Icon className="size-5" />
						</a>
					</li>
				))}
			</ul>
		</aside>
	);
}
