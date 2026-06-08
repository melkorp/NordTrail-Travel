"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Неверный пароль");
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      {/* Фоновые градиенты */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="relative bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 w-full max-w-sm shadow-2xl"
      >
        {/* Иконка замка */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-linear-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-xl font-heading text-white text-center mb-2">
          Вход в панель управления
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          NordTrail Travel
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"
          >
            <p className="text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 text-white rounded-xl mb-4 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all placeholder:text-slate-600"
        />

        <button
          type="submit"
          className="w-full px-4 py-3 bg-linear-to-r from-cyan-500 to-purple-500 text-white font-heading text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 group"
        >
          Войти
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </motion.form>
    </div>
  );
}
