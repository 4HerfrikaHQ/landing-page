import { MotionProvider } from "@/components/motion/motion-provider";
import { NoScriptReveal } from "@/components/motion/no-script-reveal";
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
				<NoScriptReveal />
				<MotionProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</MotionProvider>
			</NuqsAdapter>
		</NextIntlClientProvider>
	);
}
