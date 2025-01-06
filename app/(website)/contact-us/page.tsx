import Image from "next/image";
import React from "react";
import { BsTelephone } from "react-icons/bs";
import {
  FaInstagram,
  FaLinkedinIn,
  FaLocationDot,
  FaRegEnvelope,
  FaXTwitter,
} from "react-icons/fa6";

const Contact = () => {
  return (
    <section className="h-screen grid py-10">
      <img
        src="/assets/contact/background.png"
        alt="hero"
        className="object-cover absolute top-0 w-full"
      />
      <section className="shadow-lg max-w-5xl container mx-auto p-16 rounded-lg bg-white z-10">
        <h1 className="text-primary-500 text-2xl p-4 text-center underline underline-offset-4 capitalize font-semibold">
          Get in touch
        </h1>

        <section className="mt-10 flex gap-10">
          <form className="w-full md:col-span-3 flex flex-col gap-3">
            <h3 className="text-md md:text-xl text-gray-400 font-semibold mb-4 tracking-wider">
              Leave us a message
            </h3>
            <input
              type="text"
              className="border w-full px-3 py-2 border-gray-300/50 bg-transparent text-gray-300 placeholder:text-gray-300 rounded"
              placeholder="Name"
            />
            <input
              type="email"
              name=""
              id=" "
              className="border w-full px-3 my-7 py-2 border-gray-300/50 bg-transparent text-gray-300 placeholder:text-gray-300 rounded"
              placeholder="Email Address"
            />
            <textarea
              name=""
              id=""
              className="border w-full px-3 py-2 h-32 border-gray-300/50 bg-transparent text-gray-300 placeholder:text-gray-300 rounded"
              placeholder="Your Message"
            />
            <button
              type="submit"
              className="bg-primary-500 rounded-md w-full text-center text-white hover:bg-opacity-80 mt-5 py-2"
            >
              Send
            </button>
          </form>
          <div className="w-full md:col-span-2 flex flex-col gap-4">
            <p className="flex  text-lg items-center gap-3 text-gray-300">
              <FaLocationDot /> <span>Africa</span>
            </p>
            <p className="flex  text-lg items-center gap-3 text-gray-300 my-3">
              <BsTelephone /> <span>09082009908</span>
            </p>
            <p className="flex  text-lg items-center gap-3 text-gray-300">
              <FaRegEnvelope /> <span>support@4herfrika.org</span>
            </p>
            <ul className="flex items-center gap-6 text-gray-300 mt-4">
              <li>
                <FaInstagram />
              </li>
              <li>
                <FaXTwitter />
              </li>
              <li>
                <FaLinkedinIn />
              </li>
            </ul>
            <div className="relative w-full min-h-48 mt-7">
              <Image
                src="/assets/contact/map.jpg"
                alt="map"
                fill
                className="object-cover rounded-md "
              />
            </div>
          </div>
        </section>
      </section>
    </section>
  );
};

export default Contact;
