"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 1.5,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduce = useReducedMotion();
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const display = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      if (shouldReduce) {
        motionValue.set(target);
      } else {
        motionValue.set(0);
        requestAnimationFrame(() => motionValue.set(target));
      }
    } else {
      // Reset when out of view so it animates again on re-entry
      motionValue.set(0);
    }
  }, [isInView, motionValue, target, shouldReduce]);

  if (shouldReduce) {
    return (
      <span ref={ref} className={className}>
        {target}
      </span>
    );
  }

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
