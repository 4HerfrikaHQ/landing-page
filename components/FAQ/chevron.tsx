import type { SVGProps } from "react";

export default function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" {...props}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M50.667 24 32 42.667 13.333 24"/>
    </svg>
  );
}
