import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Logo from "../4herfrika-logo";

export const Footer = async () => {
	const t = await getTranslations("footer");
	return (
		<footer className="bg-secondary-500">
			<div className="mx-auto container px-4 pb-6 lg:pt-16 sm:px-6 lg:px-8">
				<div className="flex flex-col-reverse gap-8 pt-16 md:grid md:grid-cols-3 lg:grid-cols-5">
					<div className="text-center sm:text-left">
						<p className="font-bold text-muted-foreground text-xl">{t("quickLinks")}</p>
						<ul className="mt-8 space-y-4 text-base">
							<li>
								<Link
									href={"/blog" as Route}
									className="text-white transition hover:text-white/75"
								>
									Projects
								</Link>
							</li>
							<li>
								<Link
									href={"/careers-corner" as Route}
									className="text-white transition hover:text-white/75"
								>
									Become an Ambassador
								</Link>
							</li>
							<li>
								<Link
									href={"/careers-corner" as Route}
									className="text-white transition hover:text-white/75"
								>
									Volunteer as a Mentor
								</Link>
							</li>
							<li>
								<Link
									href={"/donate" as Route}
									className="text-white transition hover:text-white/75"
								>
									Donate
								</Link>
							</li>
							<li>
								<Link
									href={"/faq" as Route}
									className="text-white transition hover:text-white/75"
								>
									FAQs
								</Link>
							</li>
						</ul>
					</div>

					<div className="text-center sm:text-left">
						<p className="font-bold text-muted-foreground text-xl">{t("legal")}</p>
						<ul className="mt-8 space-y-4 text-base">
							<li>
								<Link
									href={"/terms" as Route}
									className="text-white transition hover:text-white/75"
								>
									{t("terms")}
								</Link>
							</li>
							<li>
								<Link
									href={"/privacy" as Route}
									className="text-white transition hover:text-white/75"
								>
									{t("privacy")}
								</Link>
							</li>
						</ul>
					</div>

					<div className="text-center sm:text-left">
						<p className="font-bold text-muted-foreground text-xl">{t("contactUs")}</p>
						<ul className="mt-8 space-y-4 text-base">
							<li>
								<a
									href="tel:+2349082009908"
									className="text-white transition hover:text-white/75"
								>
									+234(0)9082009908
								</a>
							</li>
							<li>
								<a
									href="mailto:4herfrika@gmail.com"
									className="text-white transition hover:text-white/75"
								>
									4herfrika@gmail.com
								</a>
							</li>
							<li>
								<Link
									href={"/contact-us" as Route}
									className="text-white transition hover:text-white/75"
								>
									{t("support")}
								</Link>
							</li>
						</ul>
					</div>

					<div className="text-center sm:text-left md:col-span-4 lg:col-span-2">
						<div className="bg-muted/20 p-12 rounded-2xl md:mt-4 lg:-mt-8">
							<p className="font-bold text-muted-foreground text-2xl">{t("subscribe")}</p>

							<div className="mx-auto mt-4 md:max-w-md sm:ms-0">
								<form className="mt-4">
									<div className="flex flex-row lg:items-start">
										<label htmlFor="email" className="sr-only">
											{t("emailPlaceholder")}
										</label>

										<input
											className="w-full rounded-tl-md rounded-bl-md border-border px-6 py-3 shadow-sm placeholder:text-primary-500/60 focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs"
											type="email"
											placeholder={t("emailPlaceholder")}
										/>

										<Button
											className="rounded-br-md rounded-tr-md rounded-tl-none rounded-bl-none bg-primary-500/60 px-8 py-4 font-bold text-white hover:bg-primary-500/65"
											type="submit"
										>
											<ArrowRight className="h-4 w-4 text-white" />
										</Button>
									</div>
									<p className="text-lg text-muted-foreground mt-2">
										{t("subscribeDescription")}
									</p>
								</form>
							</div>
						</div>
					</div>
				</div>

				<hr className="w-full bg-white opacity-25 mt-9 mb-6" />

				<div className="pt-3 flex flex-col justify-center items-center gap-4 sm:flex-row sm:justify-between">
					<p className="flex flex-row items-center gap-4 text-center text-sm text-muted-foreground sm:text-left">
						<Link
							href={"/" as Route}
							className="bg-background hover:bg-background/90 rounded-md px-2 py-1 w-32"
						>
							<Logo className="w-full md:h-fit" />
						</Link>
					</p>

					<p className="text-sm text-white text-center">
						&copy; {new Date().getFullYear()} 4HerFrika. {t("allRightsReserved")}
					</p>

					<ul className="mt-4 flex justify-center gap-6 sm:mt-0 sm:justify-start">
						<li>
							<a
								href="https://www.linkedin.com/company/4herfrika"
								rel="noreferrer"
								target="_blank"
								className="text-white transition hover:text-muted/75 block p-4 border-[1.5px] border-muted/30 rounded-full"
							>
								<span className="sr-only">LinkedIn</span>
								<Linkedin className="h-3 w-3" />
							</a>
						</li>
						<li>
							<a
								href="https://www.instagram.com/4herfrika"
								rel="noreferrer"
								target="_blank"
								className="text-white transition hover:text-muted/75 block p-4 border-[1.5px] border-muted/30 rounded-full"
							>
								<span className="sr-only">Instagram</span>
								<Instagram className="h-3 w-3" />
							</a>
						</li>
						<li>
							<a
								href="https://twitter.com/4herfrika"
								rel="noreferrer"
								target="_blank"
								className="text-white transition hover:text-muted/75 block p-4 border-[1.5px] border-muted/30 rounded-full"
							>
								<span className="sr-only">X</span>
								<Twitter className="h-3 w-3" />
							</a>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
};
