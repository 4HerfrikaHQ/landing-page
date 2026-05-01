import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Analytics from "./analytics";

const outfitSans = Outfit({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
      <body className={`${outfitSans.className} antialiased`}>
        <Analytics/>
				{children}
				<Toaster position="top-right" richColors closeButton />
			</body>
		</html>
	);
}
