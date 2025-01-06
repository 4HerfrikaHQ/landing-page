import Link from "next/link";
import Image from "next/image";
import FaqBody from "@/components/FaqBody";
export default function About() {
  return (
    <section>
      <div className="bg-[url('/assets/about/hero.webp')] bg-no-repeat bg-cover bg-[10%_35%]">
        <div className="flex flex-col items-center gap-12 justify-center w-full h-screen bg-overlay-gradient text-center text-white">
          <h1 className="text-6xl">About 4HerFrika</h1>
          <p className="capitalize text-xl">
            At 4HerFrika, we strive to train, mentor, and empower women <br />
            to become transformative leaders across Africa.
          </p>
          <div className="flex gap-2 text-sm font-medium">
            <Link
              href="/"
              className="py-2 px-6 border border-white rounded-full bg-transparent hover:border-transparent hover:bg-primary-500 hover:no-underline"
            >
              Make an Impact
            </Link>
            <Link
              href="/"
              className="py-2 px-6 border border-transparent rounded-full bg-primary-500 hover:bg-transparent hover:border-primary-500 hover:no-underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 px-14 bg-[url('/assets/aboutLogo.png')] bg-no-repeat bg-[center_20rem]">
        <div className="md:bg-[url('/assets/aboutVector.png')] bg-no-repeat bg-[right_1px]">
          <div className="md:bg-[url('/assets/aboutFrame.png')] bg-no-repeat bg-[center_3rem] flex flex-col gap-24">
            <h1 className="text-4xl text-center font-semibold text-gray-400">
              Where Every Girl Achieve Their Goal
            </h1>
            <div className="flex flex-col gap-14 max-w-[1208px] mx-auto w-11/12">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col gap-6 justify-center md:w-[528px]">
                  <h4 className="text-3xl font-semibold underline decoration-[#EC008C] leading-10 text-gray-400">
                    Mission Statement
                  </h4>
                  <p className="text-xl text-gray-300">
                    To raise self sufficient leaders from university and high
                    schools across Africa for community impact.
                  </p>
                </div>
                <Image
                  src="/assets/about/about1.png"
                  width={648}
                  height={309}
                  alt="group of happy girls"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <Image
                  src="/assets/about/about2.png"
                  alt="4herfika t-shirt"
                  width={648}
                  height={309}
                />

                <div className="flex flex-col gap-6 justify-center md:w-[528px]">
                  <h4 className="text-3xl font-semibold underline decoration-[#EC008C] leading-10 text-gray-400">
                    Vision Statement
                  </h4>
                  <p className="text-xl text-gray-300 text-justify">
                    We envision 4herfrika in all tertiary <br /> institutions
                    across sub-Saharan Africa and to have impacted 2 million
                    women and girls with tech and entrepreneurship by 2030.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-500/30 flex items-center w-full py-20">
        <div className="max-w-[1339px] mx-auto flex flex-col md:flex-row gap-8">
          <div className="flex flex-col gap-10 justify-center items-center md:w-[426px]">
            <h1 className="text-5xl text-secondary-500 font-bold">
              Core Values
            </h1>
            <Link
              href="/join-us"
              className="py-2 px-6 text-primary-500 border border-primary-500 w-fit rounded-full bg-transparent hover:bg-transparent hover:border-primary-500 hover:no-underline"
            >
              Join Us
            </Link>
          </div>
          <div className="flex  gap-8 text-center text-[#03065C]  flex-col md:flex-row font-bold md:w[884px]">
            <div className="md:w-[200px] w-full h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
              <Image
                src="/assets/about/Empowerment.png"
                alt="Empowerment icon"
                width={70}
                height={10}
                className="rounded-3xl"
              />
              <p className="text-base">Empowerment</p>
            </div>
            <div className="md:w-[200px] w-full h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
              <Image
                src="/assets/about/Growth.png"
                alt="Community Development icon"
                width={70}
                height={10}
                className="rounded-3xl"
              />
              <p className="text-base">Community Development</p>
            </div>
            <div className="md:w-[200px] w-full h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
              <Image
                src="/assets/about/Leader.png"
                alt="Leadership icon"
                width={70}
                height={10}
                className="rounded-3xl"
              />
              <p className="text-base">Leadership</p>
            </div>
            <div className="md:w-[200px] w-full h-[242px] px-3.5 gap-4 border rounded border-secondary-500 justify-center flex flex-col items-center">
              <Image
                src="/assets/about/Conversation.png"
                alt="Mentorship icon"
                width={70}
                height={10}
                className="rounded-3xl"
              />
              <p className="text-base">Mentorship</p>
            </div>
          </div>
        </div>
      </div>
      {/* <FaqBody /> */}
    </section>
  );
}
