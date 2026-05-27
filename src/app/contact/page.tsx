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
// Анимация появления: медленная, плавная
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
        {/* Schema.org разметка для SEO */}
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

        <div className="w-full max-w-xl mx-auto text-center">
          {/* Заголовок */}
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-4xl md:text-5xl font-heading font-semibold text-text mb-4 tracking-tight"
          >
            Связь с севером
          </motion.h1>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            transition={{ delay: 0.1 }}
            className="text-text-muted mb-10 leading-relaxed"
          >
            По вопросам сотрудничества, приобретения сайта или размещения
            материалов свяжитесь с нами.
          </motion.p>

          {/* Золотой разделитель */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-px bg-accent-bright mx-auto mb-10"
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
              className="group inline-flex items-center gap-3 px-8 py-4 border border-accent-bright/30 text-accent-bright hover:bg-accent-bright hover:text-bg transition-all duration-500 rounded-sm"
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
            className="flex justify-center gap-6"
          >
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
              { icon: Globe, href: "https://linkedin.com", label: "LinkedIn" },
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
                className="text-text/40 hover:text-accent-bright hover:-translate-y-px transition-all duration-500"
              >
                <social.icon size={22} strokeWidth={1.5} />
              </a>
            ))}
          </motion.div>
        </div>
      </main>
    </>
  );
}
