import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import type { Course } from "../../_helpers";
import type { CompletionPolicy } from "../../_schema";
import { policyRules } from "../_helpers";

export function FinishPanel({
	course,
	policy,
	className,
}: {
	course: Course;
	policy: CompletionPolicy;
	className?: string;
}) {
	const t = useTranslations("academy.course");
	const titleId = useId();
	return (
		<section
			aria-labelledby={titleId}
			className={`rounded-3xl bg-surface-indigo p-5 ${className ?? ""}`}
		>
			<h2 id={titleId} className="text-base font-semibold text-secondary-500">
				{t("finishTitle")}
			</h2>
			<ul className="mt-3 flex flex-col gap-2.5">
				{policyRules(policy, course).map((rule) => (
					<li key={rule.id} className="flex gap-3 text-sm text-foreground">
						<Check
							className="mt-0.5 size-4 shrink-0 text-secondary-500"
							aria-hidden="true"
						/>
						<span>{t(`rules.${rule.id}`, rule.values)}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
