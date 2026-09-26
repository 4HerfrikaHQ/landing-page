import { routing } from "@/i18n/routing";

export function mentorLoginUrl({
	email,
	locale,
}: {
	email?: string | null;
	locale?: string;
}) {
	const params = new URLSearchParams();
	if (email) params.set("email", email);
	if (locale && locale !== routing.defaultLocale) params.set("locale", locale);
	const query = params.toString();
	return query ? `/dashboard/login?${query}` : "/dashboard/login";
}
