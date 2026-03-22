"use client";

import { motion, useReducedMotion } from "motion/react";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const shouldReduce = useReducedMotion();
  const words = children.split(" ");

  if (shouldReduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-50px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
      aria-label={children}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
