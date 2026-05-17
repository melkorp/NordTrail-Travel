"use client";

import { motion } from "framer-motion";

// Плавная "дорогая" анимация: кубическая кривая Безье как строка
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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
    <section className="relative min-h-screen flex items-center justify-start px-6 md:px-12 lg:px-20 py-24 bg-bg overflow-hidden">
      {/* Фоновый градиент для глубины */}
      <div className="absolute inset-0 bg-linear-to-br from-bg via-bg to-primary/10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Заголовок */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading tracking-tight leading-[0.95] mb-6 ${
            isAccent
              ? "bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
              : "text-text"
          } text-balance`}
        >
          NordTrail Travel
        </motion.h1>

        {/* Подзаголовок */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-lg md:text-xl text-text/70 font-body max-w-xl mb-10 leading-relaxed"
        >
          Откройте северную роскошь путешествий
        </motion.p>

        {/* Кнопки */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            className={`px-8 py-4 font-heading text-sm tracking-widest uppercase transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
              isAccent
                ? "bg-accent text-bg hover:bg-accent/90"
                : "bg-primary text-bg hover:bg-primary/80"
            }`}
          >
            Направления
          </button>

          <button
            className={`px-8 py-4 font-heading text-sm tracking-widest uppercase border transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
              isAccent
                ? "border-accent/30 text-accent hover:bg-accent/10"
                : "border-text/20 text-text/70 hover:border-primary hover:text-primary"
            }`}
          >
            Блог
          </button>
        </motion.div>
      </div>
    </section>
  );
}
