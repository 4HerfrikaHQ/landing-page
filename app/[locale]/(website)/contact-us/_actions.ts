import { getFaqPage } from "../faq/_actions";
import { QUICK_ANSWER_QUESTIONS } from "./_schema";

export async function getQuickAnswerQuestions() {
	const page = await getFaqPage().catch(() => null);
	if (!page) return [];

	const available = new Set(
		page.data.frequently_asked_questions.flatMap(({ section }) => {
			const data = (
				section as unknown as {
					data?: { faq?: Array<{ question: string }> };
				}
			).data;
			return (data?.faq ?? []).map(({ question }) => question.trim());
		}),
	);

	return QUICK_ANSWER_QUESTIONS.filter((question) => available.has(question));
}
