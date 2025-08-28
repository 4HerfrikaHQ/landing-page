
import "../globals.css";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";


export default function WebLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
}
