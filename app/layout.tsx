import { PrismicPreview } from "@prismicio/next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { repositoryName } from "@/prismicio";
import Analytics from "./analytics";
import { Providers } from "./providers";

const outfitSans = Outfit({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	variable: "--font-outfit",
});

const playfairDisplay = Playfair_Display({
	weight: ["500", "800", "900"],
	style: ["normal", "italic"],
	subsets: ["latin"],
	variable: "--font-playfair",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body
				className={`${outfitSans.className} ${playfairDisplay.variable} antialiased`}
			>
				<Analytics />
				<Providers>{children}</Providers>
				<Toaster position="top-right" richColors closeButton />
				<PrismicPreview repositoryName={repositoryName} />
			</body>
		</html>
	);
}
