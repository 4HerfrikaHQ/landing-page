import { Link } from "@/i18n/navigation";
import { mentorLoginUrl } from "@/src/lib/mentor-login-url";
import { Instagram, Linkedin } from "lucide-react";
import type { Route } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import NextLink from "next/link";
import type { ReactNode } from "react";
import Logo from "../4herfrika-logo";
import { CONTACT_EMAIL, CONTACT_PHONE, JOIN_US_URL } from "../navigation";
import { SubscribeForm } from "./subscribe";
import { XLogo } from "./x-logo";

const FOOTER_LINK_STYLES =
	"inline-flex min-h-11 items-center rounded-md text-[15px] text-white/85 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white";

export const SOCIAL_LINKS = [
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/company/4herfrika",
		Icon: Linkedin,
	},
	{
		name: "Instagram",
		href: "https://www.instagram.com/4herfrika",
		Icon: Instagram,
	},
	{ name: "X", href: "https://x.com/4herfrika", Icon: XLogo },
];

function FooterColumn({
	title,
	children,
}: { title: string; children: ReactNode }) {
	return (
		<div>
			<h2 className="text-[15px] font-bold">{title}</h2>
			<ul className="mt-4">{children}</ul>
		</div>
	);
}

export const Footer = async () => {
	const [t, tn, tc, locale] = await Promise.all([
		getTranslations("footer"),
		getTranslations("nav"),
		getTranslations("common"),
		getLocale(),
	]);

	const quickLinks = [
		{ label: tn("academy"), href: "/academy" },
		{ label: tc("becomeAmbassador"), href: JOIN_US_URL },
		{ label: tc("volunteerAsMentor"), href: "/careercorner/apply" },
		{ label: t("faqs"), href: "/faq" },
	] as const;

	const impactLinks = [
		{ label: t("impact"), href: "/impact" },
		{ label: tn("projects"), href: "/projects" },
		{ label: tc("donate"), href: "/donate" },
	] as const;

	return (
		<footer
			data-site-footer
			className="bg-secondary px-6 py-14 text-secondary-foreground lg:px-20 lg:py-20"
		>
			<div className="mx-auto max-w-6xl">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr]">
					<FooterColumn title={t("quickLinks")}>
						{quickLinks.map((link) => (
							<li key={link.label}>
								<FooterLink href={link.href} label={link.label} />
							</li>
						))}
						<li>
							<NextLink
								href={mentorLoginUrl({ locale }) as Route}
								className={FOOTER_LINK_STYLES}
							>
								{t("mentorLogin")}
							</NextLink>
						</li>
					</FooterColumn>

					<FooterColumn title={t("impact")}>
						{impactLinks.map((link) => (
							<li key={link.href}>
								<Link href={link.href} className={FOOTER_LINK_STYLES}>
									{link.label}
								</Link>
							</li>
						))}
					</FooterColumn>

					<FooterColumn title={t("contact")}>
						<li>
							<a href={CONTACT_PHONE.href} className={FOOTER_LINK_STYLES}>
								{CONTACT_PHONE.display}
							</a>
						</li>
						<li>
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className={FOOTER_LINK_STYLES}
							>
								{CONTACT_EMAIL}
							</a>
						</li>
						<li className="flex flex-wrap items-center gap-x-3">
							<Link href="/terms" className={FOOTER_LINK_STYLES}>
								{t("terms")}
							</Link>
							<span aria-hidden="true" className="text-white/85">
								·
							</span>
							<Link href="/privacy" className={FOOTER_LINK_STYLES}>
								{t("privacy")}
							</Link>
						</li>
					</FooterColumn>

					<div id="newsletter" className="min-w-0 scroll-mt-32">
						<SubscribeForm />
					</div>
				</div>

				<div className="mt-12 h-px bg-white/10" />

				<div className="mt-7 flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
					<Link
						href="/"
						aria-label={tn("homeLabel")}
						className="rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
					>
						<Logo alt="" tone="white" className="h-9 w-auto" />
					</Link>
					<p className="text-center text-[15px] text-white/85">
						&copy; {new Date().getFullYear()} 4HerFrika.{" "}
						{t("allRightsReserved")}
					</p>
					<ul aria-label={t("socialLabel")} className="flex gap-3">
						{SOCIAL_LINKS.map(({ name, href, Icon }) => (
							<li key={name}>
								<a
									href={href}
									target="_blank"
									rel="noreferrer"
									aria-label={name}
									className="inline-grid size-11 place-items-center rounded-pill border border-white/15 press outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
								>
									<Icon className="size-4" />
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</footer>
	);
};

function FooterLink({ href, label }: { href: string; label: string }) {
	if (href.startsWith("http")) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={FOOTER_LINK_STYLES}
			>
				{label}
			</a>
		);
	}
	return (
		<Link href={href as Route} className={FOOTER_LINK_STYLES}>
			{label}
		</Link>
	);
}
