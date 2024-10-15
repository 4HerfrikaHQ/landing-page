import Image from "next/image";
import Link from "next/link";
import { FaArrowRightLong, FaStar } from "react-icons/fa6";

export default function HomePage() {
  return (
    <section className="bg-white  w-full">
      <section className="relative  px-7">
        {/* Curvy Background */}
        <Image
          src="/assets/vector.png"
          alt=" "
          width={1050}
          height={1000}
          className="gradient"
        />

        {/* Hero Section */}
        <section className="mx-auto container h-[90vh] flex items-center justify-between gap-5 w-full  py-2">
          <div>
            <h1 className="text-gray-400 text-6xl font-semibold capitalize tracking-wide">
              Raising <span className="text-pink-500">World-class</span> women
            </h1>
            <p className="text-xl text-gray-300 my-7">
              4HERFRIKA is raising world class female leaders at the
              intersection of business and technology
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <button className="border px-6 py-2 rounded-full border-pink-500 text-pink-500 text-md capitalize">
                Learn more
              </button>
              <button className="border px-6 py-2 rounded-full border-pink-500 text-white text-md bg-pink-500 capitalize">
                Get Started
              </button>
            </div>
          </div>
          <div className="hidden lg:block relative md:w-5/12 h-full lg:w-1/2 aspect-square self-end">
            <Image
              src={"/assets/hero.png"}
              alt="hero image"
              fill
              className="object-cover"
            />
          </div>
        </section>
        {/* Metric Section */}
        <section className="w-full h-full md:h-60 my-7 py-6 flex items-center justify-center gap-10 md:flex-row flex-col">
          <div className="text-gray-400 mx-8">
            <h3 className="text-5xl font-bold text-center">
              700<span className="text-pink-500">+</span>
            </h3>
            <p className="text-center mt-2 font-medium text-mb capitalize">
              members
            </p>
          </div>
          <hr className="border md:h-2/3 md:w-0 w-1/3 border-gray-400 " />
          <div className="text-gray-400 mx-8">
            <h3 className="text-5xl font-bold text-center">
              17<span className="text-pink-500">+</span>
            </h3>
            <p className="text-center mt-2 font-medium text-mb capitalize">
              campuses
            </p>
          </div>
          <hr className="border md:h-2/3 md:w-0 w-1/3 border-gray-400 " />
          <div className="text-gray-400 mx-8">
            <h3 className="text-5xl font-bold text-center">
              2<span className="text-pink-500">+</span>
            </h3>
            <p className="text-center mt-2 font-medium text-mb capitalize">
              African countries
            </p>
          </div>
        </section>
      </section>
      {/* Explore Community Section */}
      <section className=" container px-7 my-8 gap-5 grid grid-cols-1 md:grid-cols-2 items-start mx-auto">
        <div className="px-12 md:border-none  border-l border-pink-400">
          <Image
            src={"/assets/boss-divas.png"}
            alt="person"
            width={1030}
            height={1000}
            className="w-32 object-cover aspect-square rounded-full"
          />
          <h3 className="text-gray-400 text-xl font-bold mt-5 capitalize">
            boss Divas
          </h3>
          <p className="text-gray-300 my-3">
            A sub-community that caters to young female entrepreneurs with an
            extended vision to reach young girls in marginalized communities. {" "}
          </p>
          <Link
            href={"/"}
            className="text-pink-500 flex capitalize items-center gap-2 mt-5"
          >
            Explore community <FaArrowRightLong className="text-md" />
          </Link>
        </div>
        <div className="px-12 border-l border-pink-400 ">
          <Image
            src={"/assets/tech-divas.png"}
            alt="person"
            width={1000}
            height={900}
            className="w-32 object-cover aspect-square rounded-full"
          />
          <h3 className="text-gray-400  text-xl font-bold mt-5 capitalize">
            Tech Divas
          </h3>
          <p className="text-gray-300 my-3">
            A sub-community that caters to women in tech with an extended vision
            to reach rural communities with digital skills.
          </p>
          <Link
            href={"/"}
            className="text-pink-500 flex capitalize items-center gap-2 mt-5"
          >
            Explore community <FaArrowRightLong className="text-md" />
          </Link>
        </div>
      </section>
      {/* Words of the street */}
      <section className="bg-neutral-400  px-7 py-10">
        <h1 className="text-gray-400 text-center text-4xl sm:text-5xl font-bold">
          <span className="text-pink-500">Words</span> on The{" "}
          <span className="text-pink-500">Street</span>
        </h1>
        <p className="text-center text-xl text-gray-400 my-4">
          Take a look at what our users say!
        </p>
        <div className="container mx-auto sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-x- gap-x-24 gap-y-10 mt-14 text-white">
          <div className="w-full h-full bg-pink-400 rounded-xl gap-2 sm:gap-0 pr-4 py-6 flex sm:items-center sm:flex-row flex-col px-4 sm:px-1">
            <Image
              src={"/assets/hero.png"}
              alt="member"
              width={700}
              height={700}
              className=" w-24 object-cover aspect-square rounded-full  sm:-ml-12"
            />
            <div className="sm:px-4">
              <p className="font-normal text-sm sm:text-md mb-5">
                4Herfrika has been an safe space for my growth, offering
                support, resources, and opportunities. It’s more than just a
                community; it&apos;s a sisterhood where women uplift and inspire
                each other.
              </p>
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-5 justify-between">
                <div>
                  <h4 className="text-xl font-medium tracking-wider">
                    Adeleke Glory
                  </h4>
                  <p className="text-sm">Student, Lautech Campus</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="w-full h-full bg-pink-400 rounded-xl gap-2 sm:gap-0 pr-4 py-6 flex sm:items-center sm:flex-row flex-col px-4 sm:px-1">
            <Image
              src={"/assets/hero.png"}
              alt="member"
              width={700}
              height={700}
              className=" w-24 object-cover aspect-square rounded-full  sm:-ml-12"
            />
            <div className="sm:px-4">
              <p className="font-normal text-sm sm:text-md mb-5">
                4Herfrika has been an safe space for my growth, offering
                support, resources, and opportunities. It’s more than just a
                community; it&apos;s a sisterhood where women uplift and inspire
                each other.
              </p>
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-5 justify-between">
                <div>
                  <h4 className="text-xl font-medium tracking-wider">
                    Adeleke Glory
                  </h4>
                  <p className="text-sm">Student, Lautech Campus</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="w-full h-full bg-pink-400 rounded-xl gap-2 sm:gap-0 pr-4 py-6 flex sm:items-center sm:flex-row flex-col px-4 sm:px-1">
            <Image
              src={"/assets/hero.png"}
              alt="member"
              width={700}
              height={700}
              className=" w-24 object-cover aspect-square rounded-full  sm:-ml-12"
            />
            <div className="sm:px-4">
              <p className="font-normal text-sm sm:text-md mb-5">
                4Herfrika has been an safe space for my growth, offering
                support, resources, and opportunities. It’s more than just a
                community; it&apos;s a sisterhood where women uplift and inspire
                each other.
              </p>
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-5 justify-between">
                <div>
                  <h4 className="text-xl font-medium tracking-wider">
                    Adeleke Glory
                  </h4>
                  <p className="text-sm">Student, Lautech Campus</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="w-full h-full bg-pink-400 rounded-xl gap-2 sm:gap-0 pr-4 py-6 flex sm:items-center sm:flex-row flex-col px-4 sm:px-1">
            <Image
              src={"/assets/hero.png"}
              alt="member"
              width={700}
              height={700}
              className=" w-24 object-cover aspect-square rounded-full  sm:-ml-12"
            />
            <div className="sm:px-4">
              <p className="font-normal text-sm sm:text-md mb-5">
                4Herfrika has been an safe space for my growth, offering
                support, resources, and opportunities. It’s more than just a
                community; it&apos;s a sisterhood where women uplift and inspire
                each other.
              </p>
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-5 justify-between">
                <div>
                  <h4 className="text-xl font-medium tracking-wider">
                    Adeleke Glory
                  </h4>
                  <p className="text-sm">Student, Lautech Campus</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
            <button className="border px-6 py-2 rounded-full border-pink-500 text-pink-500 text-md capitalize">
              View Projects
            </button>
            <button className="border px-6 py-2 rounded-full border-pink-500 text-white text-md bg-pink-500 capitalize">
              Register{" "}
            </button>
          </div>
        </div>
        <div className=" relative  h-full w-full aspect-square self-end">
          <Image
            src={"/assets/ambassador.jpg"}
            alt="ambassadors image"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </section>
    </section>
  );
}
