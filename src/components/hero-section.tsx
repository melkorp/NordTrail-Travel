"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Медленное появление без резких скачков
const gentleFade = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

interface HeroSectionProps {
  variant?: "calm" | "accent";
}

export default function HeroSection({ variant = "calm" }: HeroSectionProps) {
  const isAccent = variant === "accent";

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-bg overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-bg/90 to-accent-bright/5 pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={gentleFade}
          className="text-5xl md:text-7xl font-heading font-semibold text-text mb-4 tracking-tighter text-balance"
        >
          NordTrail Travel
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={gentleFade}
          className="text-lg md:text-xl font-body text-text-muted mb-10 leading-relaxed text-balance"
        >
          Эксклюзивные маршруты в сердце северной дикой природы
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={gentleFade}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/destinations/"
            className={`px-8 py-4 font-heading text-sm tracking-widest uppercase font-medium rounded-sm transition-all duration-500 ${
              isAccent
                ? "bg-accent-bright text-bg hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:-translate-y-px"
                : "bg-accent-calm text-bg hover:bg-accent-bright/90"
            }`}
          >
            Выбрать маршрут
          </Link>

          <Link
            href="/about/"
            className={`px-8 py-4 font-heading text-sm tracking-widest uppercase font-medium rounded-sm border transition-all duration-500 ${
              isAccent
                ? "border-accent-bright text-accent-bright hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:border-accent-bright/80"
                : "border-text/20 text-text/70 hover:border-accent-calm hover:text-accent-calm"
            }`}
          >
            О нас
          </Link>
        </motion.div>
      </div>

      {isAccent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{
            delay: 1.2,
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-12 bg-linear-to-b from-accent-bright/60 to-transparent"
        />
      )}
    </section>
  );
}
