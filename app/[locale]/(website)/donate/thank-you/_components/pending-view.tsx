import { RollLabel } from "@/components/ui/roll-label";
import { Link } from "@/i18n/navigation";
import { LoaderCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function PendingView({ reference }: { reference: string }) {
	const t = await getTranslations("donate.thanks.pending");
	return (
		<output className="mx-auto flex max-w-xl flex-col items-center text-center">
			<LoaderCircle
				className="size-14 animate-spin text-primary-500 motion-reduce:animate-none"
				aria-hidden="true"
			/>
			<h1 className="mt-6 text-[38px] font-semibold leading-[1.05] tracking-tight lg:text-[56px]">
				{t("titleFirst")}{" "}
				<em className="font-playfair font-black text-primary-500">
					{t("titleSecond")}
				</em>
			</h1>
			<p className="mt-4 text-lg text-muted-foreground">{t("text")}</p>
			<p className="mt-6 rounded-[20px] bg-white px-5 py-4 text-sm shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
				<span className="text-muted-foreground">{t("reference")}</span>{" "}
				<span className="break-all font-mono font-semibold">{reference}</span>
			</p>
			<Link
				href={{ pathname: "/donate/thank-you", query: { reference } } as never}
				className="press mt-6 inline-flex h-12 items-center rounded-full bg-primary-500 px-8 text-lg font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-primary-500"
			>
				<RollLabel>{t("checkAgain")}</RollLabel>
			</Link>
			<p className="mt-6 text-[15px] text-muted-foreground">
				<strong className="text-foreground">{t("dontPayAgain")}</strong>{" "}
				{t("closeNote")}
			</p>
			<p className="mt-4 text-sm text-muted-foreground">
				{t("help")}{" "}
				<a
					href="mailto:hello@4herfrika.org"
					className="font-medium text-primary-500 underline underline-offset-4"
				>
					hello@4herfrika.org
				</a>
			</p>
		</output>
	);
}
