import Link from "next/link";
import Image from "next/image";
import MainImg2 from "@/public/assets/main-img.png";

export default function About() {
  return (
    <section>
      <div className="bg-[url('/assets/replaced-hero-img.png')] bg-no-repeat bg-cover">
        <div className="flex flex-col items-center gap-12 justify-center w-full h-screen bg-overlay-gradient text-center text-white text">
          <h1 className="text-6xl">About 4HerFrika</h1>
          <p className="capitalize text-xl">
            At 4HerFrika, we strive to train, mentor, and empower women <br />{" "}
            to become transformative leaders across Africa.
          </p>
          <div className="flex gap-2 text-sm font-medium">
            <Link
              href="/"
              className="py-2 px-6 border border-white rounded-2xl bg-transparent hover:border-transparent hover:bg-primary-500 hover:no-underline"
            >
              Make an Impact
            </Link>
            <Link
              href="/"
              className=" py-2 px-6 border border-transparent  rounded-2xl bg-primary-500 hover:bg-transparent hover:border-primary-500 hover:no-underline"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="my-10 px-14 bg-[url('/assets/aboutLogo.png')] bg-no-repeat bg-center">
        <div className="bg-[url('/assets/aboutLogo.png')] bg-no-repeat bg-center flex flex-col gap-20">
          <h1 className="text-4xl text-center font-semibold">
            Where Every Girl Achieve Their Goal
          </h1>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col gap-6 justify-center">
                <h4 className="text-3xl font-semibold border-b-4 md:w-3/6 border-primary-500">
                  Mission Statement
                </h4>
                <p className="text-xl text-gray-500">
                  To raise self sufficient leaders from university and high
                  schools across Africa for community impact.
                </p>
              </div>
              <div>
                <Image
                  src="/assets/replaced-hero-img.png"
                  width={1000}
                  height={1000}
                  alt="group of happy girls"
                  className=""
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-8">
              <div>
                <Image
                  src={MainImg2}
                  alt="4herfika t-shirt"
                  placeholder="blur"
                />
              </div>
              <div className="flex flex-col gap-6 justify-center">
                <h4 className="text-3xl font-semibold border-b-4 md:w-3/5 border-primary-500">
                  Vision Statement
                </h4>
                <p className="text-xl text-gray-500">
                  We envision 4herfrika in all tertiary <br /> institutions
                  across sub saharan Africa and to have impacted 2 million women
                  and girls with tech and entrepreneurship by 2030.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
