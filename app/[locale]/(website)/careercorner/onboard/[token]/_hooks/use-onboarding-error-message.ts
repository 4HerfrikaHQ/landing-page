import { useTranslations } from "next-intl";

export function useOnboardingErrorMessage() {
	const t = useTranslations("onboarding.errors");
	return (key: string | undefined, fallback: string | undefined) => {
		const messageKey = key as Parameters<typeof t>[0];
		return key && t.has(messageKey) ? t(messageKey) : fallback;
	};
}
