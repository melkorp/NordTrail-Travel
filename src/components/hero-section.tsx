"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mountain, Compass, MapPin, ArrowRight } from "lucide-react";

const gentleFade = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

interface HeroSectionProps {
  variant?: "calm" | "accent";
}

export default function HeroSection({
  variant = "calm",
}: Readonly<HeroSectionProps>) {
  const isAccent = variant === "accent";

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-bg overflow-hidden">
      {/* Фоновое изображение */}
      <div className="fixed inset-0">
        <Image
          src="/images/optimized/hero-bg-1600.webp"
          alt="Норвежские фьорды на рассвете"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/60 to-bg/90" />
        <div className="absolute inset-0 bg-accent-bright/5" />

        {/* Анимированные сферы */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-bright/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-bright/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Контент */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        {/* Бейдж */}
        <motion.div variants={gentleFade} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <div className="w-2 h-2 rounded-full bg-accent-bright animate-pulse" />
            <span className="text-sm font-medium text-text-secondary">
              Премиум путешествия 2026
            </span>
          </div>
        </motion.div>

        {/* Заголовок */}
        <motion.h1
          variants={gentleFade}
          className="text-6xl md:text-8xl font-heading font-bold text-text mb-6 tracking-tighter text-balance"
        >
          <span className="text-accent-bright">NordTrail</span>
          <br />
          <span className="text-text">Travel</span>
        </motion.h1>

        {/* Описание */}
        <motion.p
          variants={gentleFade}
          className="text-xl md:text-2xl font-body text-text-secondary mb-12 leading-relaxed text-balance max-w-3xl mx-auto"
        >
          Практические гиды по{" "}
          <span className="text-accent-bright font-medium">Исландии</span>,{" "}
          <span className="text-accent-bright font-medium">Норвегии</span>,{" "}
          <span className="text-accent-bright font-medium">Японии</span> и
          другим северным направлениям — сезоны, бюджеты, маршруты.
        </motion.p>

        {/* Кнопки */}
        <motion.div
          variants={gentleFade}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            href="/destinations/"
            className="group relative px-8 py-4 font-heading text-sm tracking-widest uppercase font-medium rounded-xl bg-accent-bright text-white hover:opacity-90 transition-opacity overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Выбрать маршрут
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/about/"
            className="px-8 py-4 font-heading text-sm tracking-widest uppercase font-medium rounded-xl glass-card text-text hover:text-accent-bright transition-all duration-300"
          >
            О нас
          </Link>
        </motion.div>

        {/* Статистика */}
        <motion.div
          variants={gentleFade}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-6 text-center">
            <Mountain className="w-8 h-8 mx-auto mb-3 text-accent-bright" />
            <div className="text-3xl font-bold text-text mb-1">9+</div>
            <div className="text-sm text-text-muted">Направлений</div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center">
            <Compass className="w-8 h-8 mx-auto mb-3 text-accent-bright" />
            <div className="text-3xl font-bold text-text mb-1">50+</div>
            <div className="text-sm text-text-muted">Маршрутов</div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-3 text-accent-bright" />
            <div className="text-3xl font-bold text-text mb-1">100%</div>
            <div className="text-sm text-text-muted">Авторские гиды</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Декоративный элемент снизу */}
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
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-accent-bright/60 to-transparent"
        />
      )}
    </section>
  );
}
