import Image from "next/image";
import { FaStar } from "react-icons/fa6";

export function TestimonialCard({
  image = "/assets/home/hero.webp",
  name = "Adeleke Glory",
  role = "Student, Lautech Campus",
  rating = 5,
  text = "4Herfrika has been an safe space for my growth, offering support, resources, and opportunities. It’s more than just a community; it's a",
}) {
  return (
    <div className="w-full h-full bg-primary-500/60 rounded-xl gap-2 sm:gap-0 pr-4 py-6 flex sm:items-center sm:flex-row flex-col px-4 sm:px-1">
      <Image
        src={image}
        alt="member"
        width={700}
        height={700}
        className=" w-24 object-cover aspect-square rounded-full  sm:-ml-12"
      />
      <div className="sm:px-4">
        <p className="font-normal text-sm sm:text-md mb-5">{text}</p>
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-5 justify-between">
          <div>
            <h4 className="text-xl font-medium tracking-wider">
              {name}
              <span className="text-sm">, </span>
            </h4>
            <p className="text-sm">{role}</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: rating }).map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
