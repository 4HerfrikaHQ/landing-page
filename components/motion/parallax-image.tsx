"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface ParallaxImageProps {
  speed?: number;
  children: React.ReactNode;
  className?: string;
}

export function ParallaxImage({
  speed = 0.3,
  children,
  className,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
