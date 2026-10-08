"use client";
import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

// One easing curve and a few durations keep every section's motion consistent.
export const ease = [0.22, 1, 0.36, 1] as const;
export const once = { once: true, amount: 0.3 } as const;

export const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const stagger = (gap = 0.1, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

// reducedMotion="user" drops transform and layout animation for people who ask for it;
// components that bind values to scroll check useReducedMotion themselves.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    // domAnimation (no layout projection) keeps the bundle small; nothing here animates layout.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
