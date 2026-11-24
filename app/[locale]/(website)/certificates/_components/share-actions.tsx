import { Linkedin, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { linkedInAddUrl, whatsappShareUrl } from "../_helpers";
import { CopyLinkButton } from "./copy-link-button";

const BUTTON =
	"inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold outline-offset-2 focus-visible:outline-2 focus-visible:outline-secondary-500";

type Props = {
	courseTitle: string;
	issuer: string;
	code: string;
	completedAt: Date;
	url: string;
	printHref: string;
};

export function ShareActions({
	courseTitle,
	issuer,
	code,
	completedAt,
	url,
	printHref,
}: Props) {
	const t = useTranslations("certificates.share");
	return (
		<div className="flex flex-col gap-3">
			<a
				href={linkedInAddUrl({ courseTitle, issuer, code, completedAt, url })}
				target="_blank"
				rel="noopener noreferrer"
				className={`${BUTTON} w-full bg-[#0a66c2] text-white hover:brightness-90`}
			>
				<Linkedin className="size-5" aria-hidden="true" />
				{t("linkedin")}
				<span className="sr-only"> {t("opensNewTab")}</span>
			</a>
			<div className="grid grid-cols-2 gap-3">
				<a
					href={whatsappShareUrl(
						t("whatsappMessage", { course: courseTitle }),
						url,
					)}
					target="_blank"
					rel="noopener noreferrer"
					className={`${BUTTON} bg-[#1a7f46] text-white hover:brightness-90`}
				>
					<MessageCircle className="size-5" aria-hidden="true" />
					{t("whatsapp")}
					<span className="sr-only"> {t("opensNewTab")}</span>
				</a>
				<CopyLinkButton
					url={url}
					className={`${BUTTON} border-2 border-primary-700 bg-white text-primary-700 hover:bg-surface-pink`}
				/>
			</div>
			<a
				href={printHref}
				target="_blank"
				rel="noopener noreferrer"
				className="mx-auto inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary-500"
			>
				{t("savePdf")}
				<span className="sr-only"> {t("opensNewTab")}</span>
			</a>
		</div>
	);
}
