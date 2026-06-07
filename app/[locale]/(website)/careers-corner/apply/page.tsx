import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ApplicationForm } from "./_components/application-form";

export const metadata: Metadata = {
	title: "Become a mentor — 4HerFrika",
	description:
		"Share your time and experience with young African women in tech and business.",
};

export default async function ApplyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);

	return (
		<main className="mx-auto max-w-2xl px-4 py-16">
			<h1 className="text-3xl font-semibold tracking-tight">
				Become a 4HerFrika mentor
			</h1>
			<p className="mt-3 text-muted-foreground">
				Tell us a bit about you. Our team reviews each application and reaches
				out within a few days.
			</p>
			<div className="mt-10">
				<ApplicationForm />
			</div>
		</main>
	);
}
