import "@/app/globals.css";
import { ScrollProgress } from "@/components/motion";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ViewTransition } from "react";
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
			<ScrollProgress />
			<Navbar />
			<ViewTransition name="page">
				<div className="site-page">{children}</div>
			</ViewTransition>
			<Footer />
			<ImpactBanner />
		</NuqsAdapter>
	);
}
