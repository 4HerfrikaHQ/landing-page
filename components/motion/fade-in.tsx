"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

type Direction = "up" | "down" | "left" | "right";

interface FadeInProps extends HTMLMotionProps<"div"> {
  direction?: Direction;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

export function FadeIn({
  direction = "up",
  delay = 0,
  duration = 0.6,
  children,
  ...props
}: FadeInProps) {
  const shouldReduce = useReducedMotion();
  const offset = offsets[direction];

  return (
    <motion.div
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
