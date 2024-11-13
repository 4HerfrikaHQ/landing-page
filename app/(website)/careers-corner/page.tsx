import { counsellingMentors } from "@/utils/details";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaSearch } from "react-icons/fa";

const CareersCorner = () => {
  return (
    <section className='overflow-x-hidden'>
      <section className='overflow-hidden grid  place-content-center relative h-screen w-screen'>
        <Image
          src={"/assets/careers/Mask.png"}
          alt=' '
          width={700}
          height={1000}
          className='absolute top-0 -left-28 h-full '
        />
        <Image
          src={"/assets/careers/Mask2.png"}
          alt=' '
          width={700}
          height={1000}
          className='absolute bottom-0 -right-10  '
        />

        <div className='w-[50vw] h-[50vh] min-w-62 relative grid place-content-center '>
          <Image
            src={"/assets/careers/Adesewa.png"}
            alt=' '
            width={700}
            height={1000}
            className='size-20 absolute top-1/3 -right-32 object-cover object-top aspect-square rounded-full'
          />
          <Image
            src={"/assets/careers/Dolapo.png"}
            alt=' '
            width={700}
            height={1000}
            className='size-16 absolute -top-32 right-0 md:right-20 object-cover object-top aspect-square rounded-full'
          />
          <Image
            src={"/assets/careers/Ruphina.png"}
            alt=' '
            width={700}
            height={1000}
            className='size-16 object-cover object-top absolute -top-32 left-0 md:left-20 aspect-square rounded-full'
          />
          <Image
            src={"/assets/careers/sharon.png"}
            alt=' '
            width={700}
            height={1000}
            className='size-16 object-cover absolute -top-4 -left-20 md:-left-24 object-top aspect-square rounded-full'
          />
          <Image
            src={"/assets/careers/sosanya.png"}
            alt=' '
            width={700}
            height={1000}
            className='size-12 object-cover object-top absolute -bottom-20 -left-20 aspect-square rounded-full'
          />
          <Image
            src={"/assets/careers/Hassanat.png"}
            alt=' '
            width={700}
            height={1000}
            className='size-12 absolute -bottom-20 -right-20 object-cover object-top aspect-square rounded-full'
          />
          <h1 className='z-20 text-gray-400 text-center text-xl md:text-2xl font-semibold'>
            Welcome to <span className='text-primary-500'>‘Career Corner’</span>
            , where you can book a 10 mins call with a mentor for free to ask
            questions
          </h1>
          <form className=' w-72 mx-auto mt-4 shadow-inner shadow-primary-200/40 mt-6 flex items-center gap-4 px-4 py-3 rounded-full'>
            <span className='bg-gray-500 bg-opacity-50 rounded-full   p-2 aspect-square grid place-content-center'>
              <FaSearch className=' text-white ' />{" "}
            </span>
            <input
              type='text'
              placeholder='Search mentor'
              className='bg-transparent w-full'
            />
          </form>
        </div>
      </section>
      <section className='h-screen py-14 bg-neutral-200 px-4'>
        <section className='max-w-6xl mx-auto h-full grid md:grid-cols-2 grid-cols-1 gap-10  items-center '>
          <div className='relative w-full  h-full  min-h-80'>
            <div className='absolute -bottom-12 -right-10 size-40 rounded-full aspect-square border-[50px]  z-10 border-white'></div>
            <Image
              src='/assets/careers/Star-2.png'
              alt='star'
              width={300}
              height={400}
              className='absolute -top-6 -left-5 size-12 object-contain'
            ></Image>
            <Image
              src='/assets/careers/Star-1.png'
              alt='star'
              width={300}
              height={400}
              className='absolute -top-6 -right-5 size-12 object-contain'
            ></Image>
            <Image
              src='/assets/careers/Star-1.png'
              alt='star'
              width={300}
              height={400}
              className='absolute -bottom-6 -left-5 size-12 object-contain'
            ></Image>
            <Image
              src={"/assets/careers/Adesewa.png"}
              alt='/'
              fill
              className='object-cover object-top'
            />
          </div>
          <div>
            <h3 className='uppercase text-primary-500 text-lg'>
              featured mentor
            </h3>
            <h2 className='text-4xl font-semibold my-3 flex justify-between items-end gap-4 flex-wrap text-gray-400'>
              Adesewa
              <span className='text-primary-500 text-sm '>
                Availability: Everyday, 11am - 7pm
              </span>{" "}
            </h2>
            <p className='text-gray-400 mb-4 capitalize'>
              Product Manager & Product Designer
            </p>

            <p className='text-gray-300'>
              Adesewa is a growth driven product designer and product manager.
              Over the last 3 years, she has designed, elevated and contributed
              to build products for thousands of users in different sectors like
              Web3, Fintech, Health, Education, Beauty, Logistics, Community and
              Gaming.
            </p>
            <div className='flex items-center gap-5 my-7 w-full justify-between'>
              <Link href={"/"} className='underline text-primary-500'>
                {" "}
                Message on Linkedin
              </Link>
              <button className='bg-primary-500 w-1/2 rounded-full py-2 text-white'>
                Book a call
              </button>
            </div>
          </div>
        </section>
      </section>
      <section className='bg-primary-400 bg-opacity-10 py-10 px-4'>
        <section className='max-w-6xl mx-auto '>
          <h2 className='text-gray-400 text-4xl text-center font-semibold mb-3'>
            Book a career counseling
          </h2>
          <p className='text-center text-gray-300'>
            You can book a 10 mins call with a mentor for free to ask questions.
          </p>
          <section className='mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 '>
            {counsellingMentors.map((mentor, index) => (
              <div
                key={index}
                className=' h-full w-ful bg-secondary-500 bg-opacity-20 p-2 rounded-md'
              >
                <Image
                  src={mentor.image}
                  alt='team'
                  width={700}
                  height={1000}
                />
                <p className='text-center text-md mt-3 uppercase font-bold text-white'>
                  {mentor.name}
                </p>
                <p className='text-white text-xs text-center uppercase'>
                  {mentor.position}
                </p>
                <button className='bg-primary-500 max-w-36 w-full flex items-center justify-center mx-auto my-7 rounded-full py-2 text-white'>
                  Details
                </button>
              </div>
            ))}
          </section>
        </section>
      </section>
    </section>
  );
};

export default CareersCorner;
