"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

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
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-surface p-8 rounded-sm border border-white/10 w-full max-w-sm"
      >
        <h1 className="text-xl font-heading text-text mb-6">
          Вход в панель управления
        </h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full px-4 py-3 bg-bg border border-white/10 text-text rounded-sm mb-4 focus:border-accent-bright focus:outline-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-3 bg-accent-bright text-bg font-heading text-sm uppercase tracking-widest rounded-sm hover:-translate-y-px transition-all"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
