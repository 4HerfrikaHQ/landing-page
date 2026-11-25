import WebLayout from "@/app/[locale]/(website)/layout";
import { NotFoundView } from "@/app/_components/not-found-view";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

export default async function RootNotFound() {
	const locale = await getLocale();

	return (
		<NextIntlClientProvider locale={locale}>
			<WebLayout>
				<NotFoundView />
			</WebLayout>
		</NextIntlClientProvider>
	);
}
