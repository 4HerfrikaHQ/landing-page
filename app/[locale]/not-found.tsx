import NotFoundImage from "@/app/assets/not-found.png";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import WebLayout from "@/app/[locale]/(website)/layout";

export default async function NotFoundPage() {
	const t = await getTranslations("notFound");

	return (
		<WebLayout>
			<div className="md:min-h-screen flex flex-col items-center justify-center px-4 py-5">
				<div className="max-w-md w-full text-center space-y-4">
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
						{t("title")}
					</h1>

					<p className="text-lg sm:text-xl text-muted-foreground">
						{t("venturedOff")}
					</p>

					<div className="py-5">
						<Image
							src={NotFoundImage.src}
							alt="Person looking at map"
							width={400}
							height={400}
							className="mx-auto h-75 object-cover"
							style={{ width: "auto" }}
							priority
						/>
					</div>

					<p className="text-sm sm:text-base text-muted-foreground">
						{t("couldntFind")}
						<br />
						{t("everyDetour")}
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
						<Link
							href={"/" as Route}
							className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-primary-500 text-sm sm:text-base font-medium rounded-full text-primary-500 hover:bg-primary-50 transition-colors"
						>
							{t("tryAgain")}
						</Link>
						<Link
							href={"/" as Route}
							className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-white bg-primary-500 hover:bg-primary-600 transition-colors"
						>
							{t("takeMeHome")}
						</Link>
					</div>
				</div>
			</div>
		</WebLayout>
	);
}
