import {
	Instagram,
	Linkedin,
	Mail,
	MapPin,
	Phone,
	Twitter,
} from "lucide-react";
import Image from "next/image";
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
			<section className="shadow-lg max-w-5xl container mx-auto p-16 rounded-lg bg-background z-10">
				<h1 className="text-primary-500 text-2xl p-4 text-center underline underline-offset-4 capitalize font-semibold">
					Get in touch
				</h1>

				<section className="mt-10 flex gap-10">
					<ContactForm />
					<div className="w-full md:col-span-2 flex flex-col gap-4">
						<p className="flex text-lg items-center gap-3 text-muted-foreground">
							<MapPin className="h-5 w-5" /> <span>Africa</span>
						</p>
						<p className="flex text-lg items-center gap-3 text-muted-foreground my-3">
							<Phone className="h-5 w-5" />
							<a
								href="tel:+2349082009908"
								className="hover:underline transition"
							>
								+234(0)9082009908
							</a>
						</p>
						<p className="flex text-lg items-center gap-3 text-muted-foreground">
							<Mail className="h-5 w-5" />
							<a
								href="mailto:4herfrika@gmail.com"
								className="hover:underline transition"
							>
								4herfrika@gmail.com
							</a>
						</p>
						<ul className="flex items-center gap-6 text-muted-foreground mt-4">
							<li>
								<a
									href="https://www.instagram.com/4herfrika?igsh=MXN1dDZzcjc2d3dwaA=="
									rel="noreferrer"
									target="_blank"
									className="hover:text-muted-foreground transition"
								>
									<Instagram className="h-5 w-5" />
								</a>
							</li>
							<li>
								<a
									href="https://twitter.com/4herfrika"
									rel="noreferrer"
									target="_blank"
									className="hover:text-muted-foreground transition"
								>
									<Twitter className="h-5 w-5" />
								</a>
							</li>
							<li>
								<a
									href="https://www.linkedin.com/company/4herfrika"
									rel="noreferrer"
									target="_blank"
									className="hover:text-muted-foreground transition"
								>
									<Linkedin className="h-5 w-5" />
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
