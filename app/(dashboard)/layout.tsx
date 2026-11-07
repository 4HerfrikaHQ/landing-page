import { TooltipProvider } from "@/components/ui/tooltip";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const messages = await getMessages({ locale: routing.defaultLocale });

	return (
		<NextIntlClientProvider
			locale={routing.defaultLocale}
			messages={{
				availabilityEditor: messages.availabilityEditor,
				calendarConnection: messages.calendarConnection,
			}}
		>
			<NuqsAdapter>
				<TooltipProvider>{children}</TooltipProvider>
			</NuqsAdapter>
		</NextIntlClientProvider>
	);
}
