
import "@/app/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";


export default function WebLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<NuqsAdapter>
			<Navbar />
			{children}
			<Footer />
		</NuqsAdapter>
	);
}
