"use client";

import { AnimatedCounter } from "@/components/motion";

export const Statistic = ({
  value,
  label,
}: { value: number | null; label: string }) => (
  <div className="text-foreground">
    <h3 className="text-4xl lg:text-5xl font-bold text-center">
      {value != null ? (
        <>
          <AnimatedCounter target={value} />
          <span className="text-primary-500">+</span>
        </>
      ) : (
        <span>—</span>
      )}
    </h3>
    <p className="text-base text-center mt-2 font-medium capitalize">{label}</p>
  </div>
);
