import { TestimonialCard } from "@/components/TestimonialCard";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import {Button} from "@/components/Button";
import {JOIN_FORM_LINK} from "@/utils/constants";
import HeroCurveIcon from "./hero-curve.svg";
import CurvedArrowIcon from "./curved-arrow.svg";
import AfricaLogo from "./africa-logo.svg";
import {createClient} from "@/prismicio";
import {Content} from "@prismicio/client";
import {PrismicImage} from "@prismicio/react";
import TestimonialCarouselDots from "@/app/(website)/testimonial-carousel-dots";

const Statistic = ({ value, label }:{ value: number | null; label: string }) => (
  <div className="text-gray-400">
    <h3 className="text-md md:text-5xl font-bold text-center">
      {value}<span className="text-primary-500">+</span>
    </h3>
    <p className="text-sm md:text-base text-center mt-0.5 lg:mt-1 lg:mt-3 font-medium capitalize">
      {label}
    </p>
  </div>
)

const Community = ({image, name, description}: { image: string, name: string, description: string }) => (
  <div className="px-4 py-2 lg:py-0 md:px-12 border rounded-3xl md:border-none border-l border-primary-400">
    <Image
      src={image}
      alt="person"
      width={1030}
      height={1000}
      className="w-10 md:w-32 object-cover aspect-square rounded-full"
    />
    <h3 className="text-gray-400 text-xs lg:text-xl font-bold lg:mt-2 capitalize">
      {name}
    </h3>
    <p className="text-[10px] md:text-xl text-gray-300 mt-1 lg:mt-3 mb-3 lg:mb-8">
      {description}
    </p>
    <Link
      href={"/"}
      className="text-primary-500 flex capitalize items-center gap-2 text-[10px] lg:text-xl"
    >
      Explore community <FaArrowRightLong className="text-md"/>
    </Link>
  </div>
)

export default async function HomePage() {
  const client = createClient();

  const page = await client.getSingle<Content.HomepageDocument>("homepage");

  const {
    testimonials,
    ambassador_description,
    ambassador_image,
    ambassador_link,
    hero_image,
    members,
    campuses,
    countries
  } = page.data;


  return (
    <section className="bg-white w-screen overflow-hidden">
      <section className="px-7 relative">
        {/* Curvy Background */}
        <HeroCurveIcon
          width="100%"
          className="w-full h-full left-0 -bottom-8 lg:bottom-20 absolute -z-1"
        />

        {/* Hero Section */}
        <section
          className="flex justify-between gap-8 w-full pt-8 lg:pt-32 md:px-8 md:mx-auto relative z-1 md:container">
          <div>
            <h1
              className="text-gray-400 text-center lg:text-left text-xl lg:text-[64px] lg:leading-[96px] mb-3 lg:mb-8 tracking-widest font-bold capitalize">
            Raising <span className="text-primary-500">World<span className='hidden lg:inline'>-</span> <br/> class</span>{" "}
              women
            </h1>
            <PrismicImage field={hero_image} className='aspect-[1.16] mx-auto object-cover lg:hidden mb-2' width={278} />
            <p className="text-xs lg:text-2xl text-gray-300 mb-6 lg:mb-14 tracking-wider max-w-[730px] text-center lg:text-left">
              4HERFRIKA is raising world class female leaders at the
              intersection of business and technology
            </p>
            <div className="flex items-center gap-2 lg:gap-5 justify-center lg:justify-start flex-wrap">
              <Button href="/about" variant="outline">
                Learn more
              </Button>
              <Button href={JOIN_FORM_LINK} isExternal variant="solid">
                Get started
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative aspect-square self-end">
            <PrismicImage field={hero_image} className='aspect-[1.16] object-cover' width={523} />
          </div>
        </section>
        {/* Metric Section */}
        <section
          className="w-full h-full md:h-60 mt-7 lg:pt-6 flex items-center justify-center z-10 relative">
          <Statistic value={members} label="members"/>
          <hr className="border h-9 md:h-2/3 w-0 border-primary-500 mx-5 lg:mx-24"/>
          <Statistic value={campuses} label="campuses"/>
          <hr className="border h-9 md:h-2/3 w-0 border-primary-500 mx-5 lg:mx-24"/>
          <Statistic value={countries} label="african countries"/>
        </section>
        <CurvedArrowIcon
          className="text-center mt-4 lg:mt-0 mx-auto lg:mb-7 lg:pb-6 w-14 lg:w-32"
        />
      </section>
      {/* Explore Community Section */}
      <section className="px-5 lg:px-0 container my-6 lg:my-8 gap-5 grid md:grid-cols-2 items-start mx-auto">
        <Community image="/assets/boss-divas.png" name="Boss Divas" description="A sub-community that caters to young female entrepreneurs with an extended vision to reach young girls in marginalized communities."/>
        <Community image="/assets/tech-divas.png" name="Tech Divas" description="A sub-community that caters to women in tech with an extended vision to reach rural communities with digital skills."/>
      </section>
      {/* Words of the street */}
      {testimonials.length && (
        <section className="lg:bg-neutral-400 lg:px-7 pt-6 lg:pt-20 pb-8 lg:pb-[90px] relative">
          <AfricaLogo className="w-24 lg:w-2xs absolute -right-16 lg:-right-8 top-24 lg:top-8"/>
          <AfricaLogo className="hidden lg:block absolute left-4 bottom-0"/>
          <h1 className="text-gray-400 text-center text-xl sm:text-[67px] font-semibold mb-1 lg:mb-8">
            <span className="text-primary-500">Words</span> on The{" "}
            <span className="text-primary-500">Street</span>
          </h1>
          <p className="text-center text-sm lg:text-xl text-gray-400 mb-6 lg:mb-12">
            Take a look at what our members say!
          </p>
          <div className="container mx-auto pb-10 pr-8 sm:pb-0 sm:px-10 flex lg:grid grid-cols-2 gap-x-12 lg:gap-x-24 gap-y-10 text-white scroll-p-8 snap-x snap-mandatory overflow-auto">
            {/*This component is just here to take up space for the mobile carousel logic to work properly*/}
            <div className="w-8 block flex-shrink-0 lg:hidden"/>
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </div>
          <TestimonialCarouselDots dotsCount={testimonials.length}/>
        </section>
      )}
      {/* Ambassador Section */}
      <section className=" px-7 container mx-auto h-full grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-8 w-full lg:pt-20 pb-12 lg:pb-28">
        <div>
          <h3
            className="text-gray-400 text-center lg:text-left text-xl lg:text-4xl font-bold capitalize tracking-wide mb-2 lg:mb-6">
            Become an ambassador{" "}
          </h3>
          <p className="text-[10px] md:text-xl text-gray-300 mb-3 lg:mb-9">
            {ambassador_description}
          </p>
          <div className="lg:hidden relative h-full w-full aspect-[1.16] self-end mb-6">
            <PrismicImage
              field={ambassador_image}
              className="object-cover rounded-xl"
            />
          </div>
          <div className="flex items-center gap-4 lg:gap-6 flex-wrap justify-center lg:justify-start">
            <Button href="/" variant="outline">
              View Projects
            </Button>
            <Button href={ambassador_link.text!} isExternal>
              Join Us
            </Button>
          </div>
        </div>
        <div className="hidden lg:block relative h-full w-full aspect-[1.16] self-end">
          <PrismicImage
            field={ambassador_image}
            className="object-cover rounded-xl"
          />
        </div>
      </section>
    </section>
  );
}
