import "@/app/globals.css";
import { ScrollProgress } from "@/components/motion";
import { MotionProvider } from "@/components/motion/motion-provider";
import { NoScriptReveal } from "@/components/motion/no-script-reveal";
import { PageTransition } from "@/components/motion/page-transition";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Footer } from "./_components/footer";
import { ImpactBanner } from "./_components/impact-banner";
import { Navbar } from "./_components/navbar";

export default function WebLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NuqsAdapter>
			<NoScriptReveal />
			<ScrollProgress />
			<Navbar />
			<MotionProvider>
				<PageTransition>{children}</PageTransition>
			</MotionProvider>
			<Footer />
			<ImpactBanner />
		</NuqsAdapter>
	);
}
