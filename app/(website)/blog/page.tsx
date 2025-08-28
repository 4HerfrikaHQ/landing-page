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
			<div className="container mx-auto flex flex-col gap-12 py-8 md:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
				<h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-700">
					Upcoming Projects
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({ length: 4 }, (_, i) => (
						<div
							key={`project-${i + 1}`}
							className="flex flex-col overflow-hidden rounded-lg"
						>
							<div className="relative">
								<div
									className="h-[200px] bg-cover bg-center bg-no-repeat"
									style={{
										backgroundImage:
											"url('https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
									}}
								/>
								<div className="absolute top-0 left-0 w-full px-4">
									<div className="bg-white py-1 px-2 rounded-full max-w-fit mt-4 flex items-center gap-2">
										<div className="h-3 w-3">
											<div className="h-full w-full rounded-full border-2 border-primary-500 border-t-transparent animate-[spin_1s_ease-in-out_infinite] before:content-[''] before:absolute before:w-1 before:h-1 before:rounded-full before:bg-primary-500 before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2" />
										</div>
										<p className="text-xs font-normal">Coming Soon</p>
									</div>
								</div>
							</div>

							<div className="p-4 bg-black/10">
								<h3 className="text-xl font-semibold mb-2">
									SkillUp with 4HerFrika
								</h3>
								<p className="text-gray-600 mb-4">
									4HERFRIKA is raising world class female leaders at the
									intersection of business and technology through innovative
									training and mentorship programs...
								</p>

								<button type="button" className="text-primary-500 font-medium">
									Learn More →
								</button>
							</div>
						</div>
					))}
				</div>{" "}
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
