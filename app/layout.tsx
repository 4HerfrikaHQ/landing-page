import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const outfitSans = Outfit({
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "4Herfrika",
  description: "4Herfrika",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfitSans.className} antialiased`}>{children}</body>
    </html>
  );
}
