import { TestimonialCard } from "@/components/TestimonialCard";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import prisma from "@/utils/prisma";

export default async function HomePage() {
  const testimonials = await prisma.testimonial.findMany({
    take: 4,
  });
  return (
    <section className="bg-white w-full">
      <section className="px-7">
        {/* Curvy Background */}
        <Image
          src="/assets/vector.png"
          alt=""
          width={1050}
          height={1000}
          className="w-full h-full absolute top-0 left-0 right-0 bottom-0 z-0"
        />

        {/* Hero Section */}
        <section className="flex items-center justify-between gap-8 w-full pt-32 md:px-8 md:mx-auto relative z-1 md:container">
          <div>
            <h1 className="text-gray-400 text-6xl font-semibold capitalize tracking-wide">
              Raising <span className="text-primary-500">World-class</span>{" "}
              women
            </h1>
            <p className="text-xl text-gray-300 my-7">
              4HERFRIKA is raising world class female leaders at the
              intersection of business and technology
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <a
                href="/about"
                className="border px-6 py-2 rounded-full border-primary-500 text-primary-500 text-md capitalize"
              >
                Learn more
              </a>
              <a
                href="/join-us" // TODO: change to google form link
                className="border px-6 py-2 rounded-full border-primary-500 text-white text-md bg-primary-500 capitalize"
              >
                Get Started
              </a>
            </div>
          </div>
          <div className="hidden lg:block relative aspect-square self-end">
            <Image
              src={"/assets/home/hero.webp"}
              alt="hero image"
              width={523}
              height={447}
              className="object-cover"
            />
          </div>
        </section>
        {/* Metric Section */}
        <section className="w-full h-full md:h-60 mt-7 pt-6 flex items-center justify-center md:gap-10">
          <div className="text-gray-400 mx-8">
            <h3 className="text-lg md:text-5xl font-bold text-center">
              1000<span className="text-primary-500">+</span>
            </h3>
            <p className="text-sm md:text-base text-center mt-2 font-medium capitalize">
              members
            </p>
          </div>
          <hr className="border h-full md:h-2/3 w-0 border-gray-400 " />
          <div className="text-gray-400 mx-8">
            <h3 className="text-lg md:text-5xl font-bold text-center">
              17<span className="text-primary-500">+</span>
            </h3>
            <p className="text-sm md:text-base text-center mt-2 font-medium capitalize">
              campuses
            </p>
          </div>
          <hr className="border h-full md:h-2/3 w-0 border-gray-400 " />
          <div className="text-gray-400 mx-8">
            <h3 className="text-lg md:text-5xl font-bold text-center">
              2<span className="text-primary-500">+</span>
            </h3>
            <p className="text-sm md:text-base text-center mt-2 font-medium capitalize">
              African countries
            </p>
          </div>
        </section>
        <Image
          src="/assets/community-curved-arrow.png"
          alt=" "
          width="100"
          height="50"
          className="text-center mx-auto mb-7 pb-6"
        />
      </section>
      {/* Explore Community Section */}
      <section className=" container px-7 my-8 gap-5 grid grid-cols-1 md:grid-cols-2 items-start mx-auto">
        <div className="p-3 md:px-12 border rounded-3xl md:border-none  border-l border-primary-400">
          <Image
            src={"/assets/boss-divas.png"}
            alt="person"
            width={1030}
            height={1000}
            className="w-10 md:w-32 object-cover aspect-square rounded-full"
          />
          <h3 className="text-gray-400 text-xl font-bold mt-5 capitalize">
            boss Divas
          </h3>
          <p className="text-sm md:text-base text-gray-300 my-3">
            A sub-community that caters to young female entrepreneurs with an
            extended vision to reach young girls in marginalized communities. {" "}
          </p>
          <Link
            href={"/"}
            className="text-primary-500 flex capitalize items-center gap-2 mt-5"
          >
            Explore community <FaArrowRightLong className="text-md" />
          </Link>
        </div>
        <div className="p-3 md:px-12 border md:border-0 rounded-3xl md:rounded-none md:border-l border-primary-400 ">
          <Image
            src="/assets/tech-divas.png"
            alt="person"
            width={1000}
            height={900}
            className="w-10 md:w-32 object-cover aspect-square rounded-full"
          />
          <h3 className="text-gray-400  text-xl font-bold mt-5 capitalize">
            Tech Divas
          </h3>
          <p className="text-sm md:text-base text-gray-300 my-3">
            A sub-community that caters to women in tech with an extended vision
            to reach rural communities with digital skills.
          </p>
          <Link
            href={"/"}
            className="text-primary-500 flex capitalize items-center gap-2 mt-5"
          >
            Explore community <FaArrowRightLong className="text-md" />
          </Link>
        </div>
      </section>
      {/* Words of the street */}
      {testimonials.length && (
        <section className="bg-neutral-400  px-7 py-10">
          <h1 className="text-gray-400 text-center text-4xl sm:text-5xl font-bold">
            <span className="text-primary-500">Words</span> on The{" "}
            <span className="text-primary-500">Street</span>
          </h1>
          <p className="text-center text-xl text-gray-400 my-4">
            Take a look at what our members say!
          </p>
          <div className="container mx-auto sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-x- gap-x-24 gap-y-10 mt-14 text-white">
            {testimonials.map((t) => (
              <TestimonialCard
                name={t.name}
                image={t.pictureId ?? ""}
                text={t.message ?? ""}
                rating={t.rating}
              />
            ))}
          </div>
        </section>
      )}
      {/* Ambassador Section */}
      <section className=" px-7 container mx-auto h-full grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-8 w-full  py-6">
        <div>
          <h3 className="text-gray-400 text-4xl font-semibold capitalize tracking-wide">
            Become an ambassador{" "}
          </h3>
          <p className="text-xl text-gray-300 my-7">
            Are you an undergraduate in any campus institute in Africa? Join our
            fast growing community to be a part of our capacity building
            initiatives and impact led programs.
          </p>
          <div className="flex items-center gap-5 flex-wrap">
            <Link
              href="/" // TODO: change to blog page
              className="border px-6 py-2 rounded-full border-primary-500 text-primary-500 text-md capitalize"
            >
              View Projects
            </Link>
            <Link
              href="/join-us"
              className="border px-6 py-2 rounded-full border-primary-500 text-white text-md bg-primary-500 capitalize hover:bg-primary-500/80"
            >
              Join Us
            </Link>
          </div>
        </div>
        <div className=" relative  h-full w-full aspect-square self-end">
          <Image
            src="/assets/home/ambassador.webp"
            alt="ambassadors image"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </section>
    </section>
  );
}
