"use client";
import { motion } from "framer-motion";

export default function FadeIn({
  children,
  delay = 0,
  once = true,
  amount = 0.1,
  direction = "up",
  margin = "-10% 0px -10% 0px",
}: {
  children: React.ReactNode;
  delay?: number;
  once?: boolean;
  amount?: number;
  direction?: "up" | "down" | "left" | "right";
  margin?: string;
}) {
  const distance = 40; // px
  const initial =
    direction === "up"
      ? { opacity: 0, y: distance }
      : direction === "down"
      ? { opacity: 0, y: -distance }
      : direction === "left"
      ? { opacity: 0, x: -distance }
      : { opacity: 0, x: distance };

  const animate = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount, margin }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
