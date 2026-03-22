"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

interface HoverCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function HoverCard({ children, ...props }: HoverCardProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
