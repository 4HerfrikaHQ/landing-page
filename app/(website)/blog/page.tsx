import BlogBody from "@/components/BlogBody";
import SearchSvg from "@/components/svgs/search";
import Image from "next/image";
import { GalleryGrid } from "./_components/gallery-grid";

export default function BlogPage() {
	return (
		<>
			<div className="bg-neutral-500 py-12 sm:py-24">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mx-auto w-full lg:mx-0">
						<h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
							Hi Divas,
						</h2>
						<p className="mt-3 text-xl leading-8 text-gray-600 font-semibold">
							Welcome to{" "}
							<span className="text-primary-500">
								&apos;The Pink Blog&apos;
							</span>
						</p>
						<p className="text-xl font-light text-[#333333] mt-2">
							This is a safe space created just for you, with experiences of
							women from all walks of life targeted to help you find your mojo
							and beauty in this chaos called LIFE
						</p>
						<div className="flex gap-4 mt-6 border border-primary-500/100 rounded-[20px] items-center px-8 ">
							<SearchSvg />
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
			<BlogBody />
			<div className="container mx-auto flex flex-col gap-12 py-20 px-4 sm:px-6 lg:px-8">
				<h2 className="pl-[30px] lg:pl-0 font-bold text-4xl text-gray-600">
					Upcoming Projects
				</h2>
				<div className="w-11/12 lg:w-full flex flex-col lg:flex-row gap-6 mx-auto">
					<Image
						width={312}
						height={404}
						alt="Upcoming"
						src="/assets/blur.png"
						className="w-full lg:w-[312px]"
					/>
					<Image
						width={312}
						height={404}
						alt="Upcoming"
						src="/assets/blur.png"
						className="w-full lg:w-[312px]"
					/>
					<Image
						width={312}
						height={404}
						alt="Upcoming"
						src="/assets/blur.png"
						className="w-full lg:w-[312px]"
					/>
					<Image
						width={312}
						height={404}
						alt="Upcoming"
						src="/assets/blur.png"
						className="w-full lg:w-[312px]"
					/>
				</div>
			</div>

			<GalleryGrid />

			<div className="w-full bg-neutral-500 pt-10 pb-14 gap-8 flex flex-col items-center px-6 lg:px-0">
				<p className="text-gray-600 text-xl font-medium text-center">
					To Partner and Donate to this organization, Please send us a mail. You
					can also make direct donations.
				</p>
				<div className="flex flex-col md:flex-row gap-6">
					<button
						type="button"
						className="border border-primary-500/100 rounded-full py-4 px-8 text-primary-500/100 text-xl font-normal"
					>
						Send a Mail
					</button>
					<button
						type="button"
						className="border-0 rounded-full py-4 px-8 bg-primary-500/100 text-white text-xl font-normal"
					>
						Pay Directly
					</button>
				</div>
			</div>
		</>
	);
}
