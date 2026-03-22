"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  children: React.ReactNode;
}

export function StaggerContainer({
  staggerDelay = 0.1,
  children,
  ...props
}: StaggerContainerProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: shouldReduce ? 0 : staggerDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
