import type { Metadata } from "next";

// Login lives outside [locale], so it inherits no site metadata. Give it a
// title/description; noindex since it's a private portal sign-in.
export const metadata: Metadata = {
	title: "Sign in — 4Herfrika Mentor Portal",
	description:
		"Sign in to the 4Herfrika Mentor Portal to manage availability, mentees, and your impact.",
	robots: { index: false, follow: false },
};

export default function LoginLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
