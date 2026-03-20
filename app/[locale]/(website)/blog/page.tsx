import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import BlogBody from "./_components/blog-body";
import { GalleryGrid } from "./_components/gallery-grid";

export default function BlogPage() {
	return (
		<>
			{/* Hero Section */}
			<div className="bg-muted py-12 md:py-16 lg:py-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto w-full lg:mx-0">
						<h2 className="text-pretty text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
							Hi Divas,
						</h2>
						<p className="mt-3 text-xl leading-8 text-muted-foreground font-semibold">
							Welcome to{" "}
							<span className="text-primary-500">
								&apos;The Pink Blog&apos;
							</span>
						</p>
						<p className="text-xl font-light text-foreground mt-2">
							This is a safe space created just for you, with experiences of
							women from all walks of life targeted to help you find your mojo
							and beauty in this chaos called LIFE
						</p>
						<div className="flex gap-4 mt-6 border border-primary-500 rounded-[20px] items-center px-8">
							<Search
								className="h-5.5 w-5.5 text-muted-foreground"
								strokeWidth={2}
							/>
							<input
								type="text"
								className="py-4 flex-1 rounded-[20px] bg-transparent outline-0"
								placeholder="Search for Post"
							/>
						</div>
						<Image
							src="/assets/blog-hero.png"
							width={1320}
							height={429}
							alt="blog-img"
							className="mt-16 hidden lg:block"
						/>
					</div>
				</div>
			</div>

			{/* Blog Posts with Category Tabs */}
			<Suspense>
				<BlogBody />
			</Suspense>

			{/* Gallery Section */}
			<GalleryGrid />

			{/* CTA Section */}
			<div className="w-full bg-muted py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto flex flex-col items-center gap-8">
					<p className="text-muted-foreground text-xl font-medium text-center">
						To Partner and Donate to this organization, Please send us a mail. You
						can also make direct donations.
					</p>
					<div className="flex flex-col md:flex-row gap-6">
						<Button variant="outline" size="lg" href="/contact-us">
							Send a Mail
						</Button>
						<Button size="lg" href="/donate">
							Pay Directly
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
