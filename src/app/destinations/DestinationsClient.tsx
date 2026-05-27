// src/app/destinations/DestinationsClient.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
                    className="group relative h-full bg-surface border border-white/5 hover:border-accent-bright/50 hover:-translate-y-px transition-all duration-500 rounded-sm p-8 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-accent-bright/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10">
                      <h2 className="text-2xl font-heading text-text group-hover:text-accent-bright transition-colors duration-500 mb-2 tracking-tight">
                        {dest.name}
                      </h2>
                      <p className="text-text-muted text-sm leading-relaxed line-clamp-2">
                        {dest.quickAnswer?.slice(0, 120) ??
                          "Готовые маршруты, сезонные гиды и приватные экспедиции."}
                      </p>
                      {(dest.bestSeason || dest.budget) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {dest.bestSeason && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted/60 border border-white/8 rounded-full px-2.5 py-0.5">
                              {dest.bestSeason.split(",")[0]}
                            </span>
                          )}
                          {dest.budget && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted/60 border border-white/8 rounded-full px-2.5 py-0.5">
                              {dest.budget} бюджет
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="relative z-10 text-xs font-heading uppercase tracking-widest text-accent-bright/80 mt-8 flex items-center gap-3">
                      Открыть маршрут
                      <span className="block w-3 h-px bg-accent-bright group-hover:w-6 transition-all duration-500" />
                    </span>
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
