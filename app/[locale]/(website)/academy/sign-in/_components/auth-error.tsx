import { useTranslations } from "next-intl";

export function AuthError({
	message,
	id,
}: { message: string | undefined; id: string }) {
	const t = useTranslations("academyAuth.errors");
	if (!message) return null;
	const key = message as Parameters<typeof t>[0];
	const text = t.has(key) ? t(key) : t("generic");
	return (
		<p
			id={id}
			role="alert"
			className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
		>
			{text}
		</p>
	);
}
