import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { type JoinLink, joinOptions } from "../_schema";

const cardClass =
	"block h-full rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:rounded-[20px] lg:p-8";

export async function AboutJoin() {
	const t = await getTranslations("about");
	return (
		<section className="bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<h2 className="text-center text-[32px] font-bold lg:text-5xl">
						{t("joinFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("joinSecond")}
						</em>
					</h2>
				</FadeIn>
				<RevealGroup className="mt-10 grid gap-4 lg:grid-cols-3">
					{joinOptions.map((option) => (
						<div key={option.titleKey}>
							<JoinCard
								link={option.link}
								title={t(option.titleKey)}
								description={t(option.descriptionKey)}
								linkLabel={t(option.linkKey)}
								newTabHint={t("newTabHint")}
							/>
						</div>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}

type JoinCardProps = {
	title: string;
	description: string;
	linkLabel: string;
	newTabHint: string;
};

function JoinCard({ link, ...props }: JoinCardProps & { link: JoinLink }) {
	if (link.kind === "external") {
		return <ExternalJoinCard href={link.href} {...props} />;
	}
	return <InternalJoinCard href={link.href} {...props} />;
}

function JoinCardContent({
	title,
	description,
	linkLabel,
}: Omit<JoinCardProps, "newTabHint">) {
	return (
		<>
			<h3 className="text-lg font-semibold">{title}</h3>
			<p className="mt-1 text-[15px] text-muted-foreground">{description}</p>
			<span className="mt-4 inline-block font-medium text-primary-500">
				{linkLabel} →
			</span>
		</>
	);
}

function InternalJoinCard({
	href,
	newTabHint: _newTabHint,
	...content
}: JoinCardProps & { href: Extract<JoinLink, { kind: "internal" }>["href"] }) {
	return (
		<Link href={href} className={cardClass}>
			<JoinCardContent {...content} />
		</Link>
	);
}

function ExternalJoinCard({
	href,
	newTabHint,
	...content
}: JoinCardProps & { href: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer noopener"
			className={cardClass}
		>
			<JoinCardContent {...content} />
			<span className="sr-only"> {newTabHint}</span>
		</a>
	);
}
