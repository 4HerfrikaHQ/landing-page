import BlogBody from "@/components/BlogBody";
import SearchSvg from "@/components/svgs/search";
import Image from "next/image";

export default function BlogPage() {
  return (
    <>
      <div className="bg-neutral-500 py-12 sm:py-24">
        <div className="mx-auto lg:w-full max-w-[1320px] w-11/12 ">
          <div className="mx-auto w-full lg:mx-0">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Hi Divas,</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Welcome to <span className="text-primary-500">The Pink Blog</span>
            </p>
            <p className="text-xl font-light text-[#333333]">
              This is a safe space created just for you, with experiences of women from all walks of life targeted to help you find your mojo and beauty in this chaos called LIFE
            </p>
            <div className="flex gap-4 mt-6 border border-primary-500/100 rounded-[20px] items-center px-8 ">
              <SearchSvg />
              <input type="text" className="py-4 flex-1 rounded-[20px] bg-transparent outline-0" placeholder="Search for Post" />
            </div>
            <Image src="/assets/blog-hero.png" width={1320} height={429} alt="blog-img" className="mt-16" />
          </div>
        </div>
      </div>
      <BlogBody />
      <div className="mx-auto w-full max-w-[1320px] flex flex-col gap-12 py-20">
        <h2 className="pl-[30px] lg:pl-0 font-bold text-4xl text-[#333333]">Upcoming Projects</h2>
        <div className="w-11/12 lg:w-full flex flex-col lg:flex-row gap-6 mx-auto">
          <Image width={312} height={404} alt="Upcoming" src="/assets/blur.png" className="w-full lg:w-[312px]" />
          <Image width={312} height={404} alt="Upcoming" src="/assets/blur.png" className="w-full lg:w-[312px]" />
          <Image width={312} height={404} alt="Upcoming" src="/assets/blur.png" className="w-full lg:w-[312px]" />
          <Image width={312} height={404} alt="Upcoming" src="/assets/blur.png" className="w-full lg:w-[312px]" />
        </div>
      </div>
      <div className="w-full bg-neutral-500 pt-10 pb-14 gap-8 flex flex-col items-center px-6 lg:px-0">
        <p className="text-[#333333] text-xl font-medium text-center">To Partner and Donate to this organization, Please send us a mail. You can also make direct donations.</p>
        <div className="flex gap-6">
          <button className="border border-primary-500/100 rounded-full py-4 px-8 text-primary-500/100 text-xl font-normal">Send a Mail</button>
          <button className="border-0 rounded-full py-4 px-8 bg-primary-500/100 text-white text-xl font-normal">Pay Directly</button>
        </div>
      </div>
    </>
  );
}

{
  /* <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
  {posts.map((post) => (
    <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
      <div className="flex items-center gap-x-4 text-xs">
        <time dateTime={post.datetime} className="text-gray-500">
          {post.date}
        </time>
        <a href={post.category.href} className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
          {post.category.title}
        </a>
      </div>
      <div className="group relative">
        <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
          <a href={post.href}>
            <span className="absolute inset-0" />
            {post.title}
          </a>
        </h3>
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
      </div>
       <div className="relative mt-8 flex items-center gap-x-4">
                <Image
                <img
                  alt=""
                  src={post.author.imageUrl}
                  className="h-10 w-10 rounded-full bg-gray-50"
                />
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">
                    <a href={post.author.href}>
                      <span className="absolute inset-0" />
                      {post.author.name}
                    </a>
                  </p>
                  <p className="text-gray-600">{post.author.role}</p>
                </div>
              </div> 
    </article>
  ))}
</div>; */
}
