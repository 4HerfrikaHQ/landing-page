import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getQuickAnswerQuestions } from "../_actions";

export async function QuickAnswers() {
	const [t, questions] = await Promise.all([
		getTranslations("contact"),
		getQuickAnswerQuestions(),
	]);
	if (questions.length === 0) return null;

	return (
		<section className="bg-surface-indigo px-4 py-14 lg:px-20 lg:py-20">
			<div className="mx-auto max-w-6xl">
				<FadeIn className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<h2 className="text-[28px] font-bold lg:text-4xl">
						{t("faqHeading")}
					</h2>
					<Link
						href="/faq"
						className="inline-flex h-11 items-center rounded-md font-medium text-primary-500 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
					>
						{t("allFaqs")} <span aria-hidden="true">&nbsp;→</span>
					</Link>
				</FadeIn>
				<RevealGroup as="ul" className="mt-8 grid gap-4 lg:grid-cols-3">
					{questions.map((question) => (
						<li key={question} className="flex">
							<Link
								href="/faq"
								className="flex w-full flex-col rounded-2xl bg-white p-6 shadow-sm outline-none transition hover:no-underline hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500"
							>
								<span className="text-lg font-semibold">{question}</span>
								<span className="mt-auto pt-4 text-[15px] font-medium text-primary-500">
									{t("readAnswer")} <span aria-hidden="true">→</span>
								</span>
							</Link>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
