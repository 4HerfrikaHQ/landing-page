import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const outfitSans = Outfit({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title:
		"4Herfrika - Raising World-Class Female Leaders at the intersection of business and technology in Africa",
	description:
		"4Herfrika is raising world-class women at the intersection of business and technology",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={cn("font-sans", geist.variable)}>
			<body className={`${outfitSans.className} antialiased`}>{children}</body>
			<Toaster position="top-right" richColors closeButton />
		</html>
	);
}
