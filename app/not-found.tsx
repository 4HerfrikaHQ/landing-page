import NotFoundImage from "@/app/assets/not-found.png";
import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

export default function RootNotFound() {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body>
				<div className="md:min-h-screen flex flex-col items-center justify-center px-4 py-5">
					<div className="max-w-md w-full text-center space-y-4">
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
							Oops! Page Not Found
						</h1>

						<p className="text-lg sm:text-xl text-muted-foreground">
							It looks like you&apos;ve ventured off the beaten path...
						</p>

						<div className="py-5">
							<Image
								src={NotFoundImage.src}
								alt="Person looking at map"
								width={400}
								height={400}
								className="mx-auto h-75 object-cover"
								priority
							/>
						</div>

						<p className="text-sm sm:text-base text-muted-foreground">
							We couldn&apos;t find the page you were looking for, but don&apos;t
							worry!
							<br />
							Every detour is an opportunity to discover something new.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
							<Link
								href={"/" as Route}
								className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-primary-500 text-sm sm:text-base font-medium rounded-full text-primary-500 hover:bg-primary-50 transition-colors"
							>
								Take me home
							</Link>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
