// src/app/contact/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Camera,
  Globe,
  Play,
  AtSign,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
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

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: buildBreadcrumbsJsonLd([
            { name: "Главная", url: "/" },
            { name: "Контакты" },
          ]),
        }}
      />
      <main className="min-h-screen bg-bg text-text font-body antialiased selection:bg-accent-bright selection:text-bg flex items-center justify-center px-6 py-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              mainEntity: {
                "@type": "Organization",
                name: "NordTrail Travel",
                email: "tamogoghi@gmail.com",
                sameAs: [
                  "https://instagram.com/nordtrail",
                  "https://linkedin.com/company/nordtrail",
                  "https://youtube.com/@nordtrail",
                  "https://twitter.com/nordtrail",
                ],
              },
            }),
          }}
        />

        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Заголовок */}
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-4xl md:text-5xl font-heading font-semibold text-text mb-4 tracking-tight"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Связь с севером
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ delay: 0.1 }}
            className="text-text-secondary mb-10 leading-relaxed"
          >
            По вопросам сотрудничества, приобретения сайта или размещения
            материалов свяжитесь с нами.
          </motion.p>

          {/* Градиентный разделитель */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-px bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mb-10"
          />

          {/* Основной CTA: Email */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <a
              href="mailto:tamogoghi@gmail.com"
              className="group inline-flex items-center gap-3 px-8 py-4 glass-card-light rounded-xl text-cyan-400 hover:text-white transition-all duration-500"
            >
              <Mail size={20} />
              <span className="font-heading text-sm tracking-widest uppercase">
                tamogoghi@gmail.com
              </span>
              <ArrowRight
                size={16}
                className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500"
              />
            </a>
          </motion.div>

          {/* Соцсети */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ delay: 0.4 }}
            className="glass-card-light rounded-2xl p-8"
          >
            <h3 className="text-lg font-heading text-text mb-6">
              Мы в социальных сетях
            </h3>
            <div className="flex justify-center gap-6">
              {[
                {
                  icon: Camera,
                  href: "https://pinterest.com",
                  label: "Pinterest",
                },
                {
                  icon: MessageCircle,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
                {
                  icon: Globe,
                  href: "https://linkedin.com",
                  label: "LinkedIn",
                },
                { icon: Play, href: "https://youtube.com", label: "YouTube" },
                {
                  icon: AtSign,
                  href: "https://twitter.com",
                  label: "X / Twitter",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-text-muted hover:text-cyan-400 hover:-translate-y-1 transition-all duration-500"
                >
                  <social.icon size={24} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
