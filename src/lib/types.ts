// src/lib/types.ts
// Единый источник типов для всего проекта.
// Импортируй отсюда вместо локальных определений.

export interface ArticleData {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  dateIso: string;
  dateDisplay: string;
  author: string;
  quickAnswer: string;
  image?: string;
  sections: { heading: string; content: string }[];
  budgetTable: { item: string; low: string; premium: string }[];
  faq: { q: string; a: string }[];
  conclusion: string;
}

export interface Destination {
  slug: string;
  name: string;
  h1: string;
  quickAnswer: string;
  bestSeason: string;
  budget: string;
  difficulty: string;
  forKids: boolean;
  safety: number;
  sections: { title: string; content: string }[];
  faq: { question: string; answer: string }[];
}
