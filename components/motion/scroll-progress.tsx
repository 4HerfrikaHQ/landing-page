"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (shouldReduce) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}
