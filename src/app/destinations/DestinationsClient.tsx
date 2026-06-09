// src/app/destinations/DestinationsClient.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Destination } from "@/lib/types";
import { buildBreadcrumbsJsonLd } from "@/lib/breadcrumbs";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function DestinationsClient({
  destinations,
}: Readonly<{
  destinations: Destination[];
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildBreadcrumbsJsonLd([
            { name: "Главная", url: "/" },
            { name: "Направления" },
          ]),
        }}
      />
      <main className="min-h-screen bg-linear-to-b from-bg via-bg to-surface/40 text-text font-body antialiased selection:bg-accent-bright selection:text-bg">
        <section className="py-24 md:py-32 px-6 max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={reveal}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-text mb-4 tracking-tight text-balance">
              Направления
            </h1>
            <p className="text-lg text-text-muted max-w-xl leading-relaxed">
              Исследуйте маршруты, которые мы тщательно отбираем, тестируем и
              формируем под ваш уровень комфорта.
            </p>
          </motion.div>

          {destinations.length === 0 ? (
            <p className="text-text-muted text-center py-20">
              Направления не найдены. Добавьте MDX-файлы в content/destinations/
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest.slug}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={reveal}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/destinations/${dest.slug}/`}
                    className="group relative h-full glass-card-light rounded-2xl overflow-hidden flex flex-col"
                  >
                    {/* Изображение */}
                    <div className="relative h-48 w-full overflow-hidden shrink-0">
                      {dest.image ? (
                        <Image
                          src={dest.image}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-b from-cyan-500/20 to-purple-500/20" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-bg/60 via-bg/20 to-transparent group-hover:from-bg/40 transition-colors duration-500" />

                      {/* Градиентный оверлей */}
                      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Текст */}
                    <div className="relative z-10 p-6 flex flex-col flex-1">
                      <h2 className="text-2xl font-heading text-text group-hover:text-cyan-400 transition-colors duration-500 mb-2 tracking-tight text-glow">
                        {dest.name}
                      </h2>
                      <p className="text-gray-900 text-[15px] leading-relaxed line-clamp-3 mb-4 font-medium text-balance">
                        {dest.quickAnswer?.slice(0, 140) ??
                          "Готовые маршруты, сезонные гиды и приватные экспедиции."}
                      </p>
                      {(dest.bestSeason || dest.budget) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {dest.bestSeason && (
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-white border border-white/40 rounded-full px-3 py-1 bg-white/10">
                              {dest.bestSeason.split(",")[0]}
                            </span>
                          )}
                          {dest.budget && (
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-300 border border-amber-400/50 rounded-full px-3 py-1 bg-amber-500/20">
                              {dest.budget} бюджет
                            </span>
                          )}
                        </div>
                      )}
                      <span className="relative z-10 text-xs font-heading uppercase tracking-widest text-cyan-400 mt-auto pt-4 flex items-center gap-3 group-hover:text-cyan-300 transition-colors duration-300">
                        Открыть маршрут
                        <span className="block w-3 h-px bg-linear-to-r from-cyan-400 to-purple-400 group-hover:w-6 transition-all duration-500" />
                      </span>
                    </div>

                    {/* Декоративное свечение */}
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
