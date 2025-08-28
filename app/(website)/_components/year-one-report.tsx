"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function YearOneReport(){
  const pathname = usePathname();

  if(pathname === "/impact") return null;

  return (
    <div className="w-full h-14 bg-primary-400 flex items-center justify-center text-white font-medium whitespace-pre">
				<span>Check out our Year-One Landscape report <Link href="/impact" className="font-bold">here!</Link></span>
			</div>
  )
}
