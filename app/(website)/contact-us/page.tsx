// contact/page.jsx (Server Component)
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
import ContactForm from "./_components/contact-form";

const Contact = () => {
	return (
		<section className="h-screen grid py-10">
			<Image
				src="/assets/contact/background.png"
				alt="hero"
				className="object-cover absolute top-0 w-full"
				fill
			/>
			<section className="shadow-lg max-w-5xl container mx-auto p-16 rounded-lg bg-white z-10">
				<h1 className="text-primary-500 text-2xl p-4 text-center underline underline-offset-4 capitalize font-semibold">
					Get in touch
				</h1>

				<section className="mt-10 flex gap-10">
					<ContactForm />
					<div className="w-full md:col-span-2 flex flex-col gap-4">
						<p className="flex text-lg items-center gap-3 text-gray-300">
							<FaLocationDot /> <span>Africa</span>
						</p>
						<p className="flex text-lg items-center gap-3 text-gray-300 my-3">
							<BsTelephone />
							<a
								href="tel:+2349082009908"
								className="hover:underline transition"
							>
								+234(0)9082009908
							</a>
						</p>
						<p className="flex text-lg items-center gap-3 text-gray-300">
							<FaRegEnvelope />
							<a
								href="mailto:4herfrika@gmail.com"
								className="hover:underline transition"
							>
								4herfrika@gmail.com
							</a>
						</p>
						<ul className="flex items-center gap-6 text-gray-300 mt-4">
							<li>
								<a
									href="https://www.instagram.com/4herfrika?igsh=MXN1dDZzcjc2d3dwaA=="
									rel="noreferrer"
									target="_blank"
									className="hover:text-gray-200 transition"
								>
									<FaInstagram />
								</a>
							</li>
							<li>
								<a
									href="https://twitter.com/4herfrika"
									rel="noreferrer"
									target="_blank"
									className="hover:text-gray-200 transition"
								>
									<FaXTwitter />
								</a>
							</li>
							<li>
								<a
									href="https://www.linkedin.com/company/4herfrika"
									rel="noreferrer"
									target="_blank"
									className="hover:text-gray-200 transition"
								>
									<FaLinkedinIn />
								</a>
							</li>
						</ul>
						<div className="relative w-full min-h-48 mt-7">
							<Image
								src="/assets/contact/map.jpg"
								alt="map"
								fill
								className="object-cover rounded-md"
							/>
						</div>
					</div>
				</section>
			</section>
		</section>
	);
};

export default Contact;
