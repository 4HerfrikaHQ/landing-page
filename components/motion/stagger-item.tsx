"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: shouldReduce ? { opacity: 0 } : { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
