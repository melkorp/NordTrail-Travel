import type { Metadata } from "next";
import type { Destination } from "../../../lib/types";

// ── Мок-данные для проверки (потом вынесем в отдельный файл) ──
const destinations: Destination[] = [
  {
    slug: "iceland",
    name: "Исландия",
    h1: "Путешествие в Исландию: маршруты, цены, сезон, советы 2026",
    quickAnswer:
      "Исландия — страна контрастов: ледники, водопады, гейзеры и северное сияние. Лучшее время для поездки — июнь-август (хайкинг, киты) или октябрь-март (сияние). Средний бюджет: 80-150€ в день. Подходит для соло-путешественников, пар и активных туристов. Минимальный маршрут — 7 дней по Ring Road.",
    bestSeason: "Июнь–август (лето), Октябрь–март (северное сияние)",
    budget: "средний",
    difficulty: "среднее",
    forKids: true,
    safety: 5,
    sections: [
      {
        title: "Почему стоит поехать в Исландию",
        content:
          "Исландия — это уникальная природа, которой нет больше нигде в Европе. Чёрные пляжи Рейнисфьяра, ледниковая лагуна Йёкюльсаурлоун, водопад Скогафосс, геотермальные источники и безлюдные дороги — всё это создаёт ощущение, что вы на другой планете. Страна также одна из самых безопасных в мире и отлично подходит для первого опыта самостоятельных путешествий.",
      },
      {
        title: "Лучшее время для поездки",
        content:
          "Летом (июнь-август) — полярный день, работают все дороги, идеально для хайкинга и кемпинга. Осенью (сентябрь-октябрь) — меньше туристов, начинается сезон северного сияния. Зимой (ноябрь-март) — короткий световой день, ледяные пещеры и лучшее время для сияния. Весной (апрель-май) — переходный сезон, туристов мало, цены ниже.",
      },
      {
        title: "Сколько стоит путешествие",
        content:
          "Бюджетно: от 60€ в день (хостелы, готовка, попутки). Комфортно: 120-180€ в день (гестхаусы, кафе, аренда авто). Люкс: от 300€ в день (отели, рестораны, экскурсии). Основные траты: жильё (30-150€), аренда авто (60-120€), еда (15-50€), экскурсии (50-150€).",
      },
    ],
    faq: [
      {
        question: "Нужна ли виза в Исландию?",
        answer:
          "Для граждан РФ требуется шенгенская виза. Исландия входит в Шенгенскую зону. Подавайте документы в визовый центр Исландии или другой страны Шенгена минимум за 2 месяца до поездки.",
      },
      {
        question: "Когда лучше ехать за северным сиянием?",
        answer:
          "Лучшее время — с октября по март. Пик приходится на декабрь-февраль. Важно: нужна ясная погода и отсутствие городской засветки. Рекомендуем выезжать за Рейкьявик в тур по сиянию.",
      },
      {
        question: "Можно ли без машины в Исландии?",
        answer:
          "Да, но ограниченно. По Рейкьявику ходит транспорт. Вдоль южного побережья есть автобусы. Но для Ring Road и высокогорья машина обязательна. Аренда — от 60€ в день.",
      },
    ],
  },
];

// ── Генерация статических страниц ──
export function generateStaticParams() {
  return destinations.map((d) => ({
    slug: d.slug,
  }));
}

// ── Динамические метаданные для SEO ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);

  if (!dest) {
    return { title: "Направление не найдено" };
  }

  return {
    title: dest.h1,
    description: dest.quickAnswer.slice(0, 160),
    openGraph: {
      title: dest.h1,
      description: dest.quickAnswer.slice(0, 160),
      type: "article",
    },
  };
}

// ── JSON-LD Schema для TouristDestination + FAQPage ──
function DestinationSchema({ dest }: { dest: Destination }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: dest.name,
    description: dest.quickAnswer,
    touristType: ["Adventure", "Nature", "Luxury"],
    address: {
      "@type": "PostalAddress",
      addressCountry: dest.name,
    },
    // FAQPage как вложенный блок
    mainEntity: dest.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Компонент хлебных крошек ──
function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-8">
      <ol className="flex text-sm text-text/50 font-body">
        <li>
          <a href="/" className="hover:text-primary transition-colors">
            Главная
          </a>
          <span className="mx-2">/</span>
        </li>
        <li>
          <a
            href="/destinations"
            className="hover:text-primary transition-colors"
          >
            Направления
          </a>
          <span className="mx-2">/</span>
        </li>
        <li className="text-text/80">{name}</li>
      </ol>

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Главная",
                item: "/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Направления",
                item: "/destinations/",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: name,
              },
            ],
          }),
        }}
      />
    </nav>
  );
}

// ── Таблица параметров ──
function ComparisonTable({ dest }: { dest: Destination }) {
  const rows = [
    { label: "Лучший сезон", value: dest.bestSeason },
    {
      label: "Средний бюджет",
      value: dest.budget === "средний" ? "80-150€/день" : dest.budget,
    },
    { label: "Сложность", value: dest.difficulty },
    { label: "Для детей", value: dest.forKids ? "Да" : "Нет" },
    { label: "Безопасность", value: "★".repeat(dest.safety) },
  ];

  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left font-body">
        <thead>
          <tr className="border-b border-text/10">
            <th className="py-3 pr-4 text-sm uppercase tracking-wider text-text/50 font-heading">
              Параметр
            </th>
            <th className="py-3 text-sm text-text font-heading">Значение</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-text/5">
              <td className="py-3 pr-4 text-text/70">{row.label}</td>
              <td className="py-3 text-text">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Сама страница ──
export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = destinations.find((d) => d.slug === slug);

  if (!dest) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg">
        <h1 className="text-2xl text-text font-heading">
          Направление не найдено
        </h1>
      </main>
    );
  }

  return (
    <>
      <DestinationSchema dest={dest} />

      <main className="min-h-screen bg-bg text-text font-body">
        <article className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <Breadcrumbs name={dest.name} />

          {/* H1 */}
          <h1
            className="text-4xl sm:text-5xl font-heading mb-6 text-balance"
            itemProp="name"
          >
            {dest.h1}
          </h1>

          {/* Quick Answer — AI-snippet */}
          <aside
            aria-label="Краткий обзор направления"
            className="bg-primary/5 border border-primary/10 rounded-lg p-5 mb-10"
          >
            <p className="text-text/80 leading-relaxed">{dest.quickAnswer}</p>
          </aside>

          {/* Comparison Table */}
          <section aria-labelledby="comparison-heading">
            <h2 id="comparison-heading" className="text-2xl font-heading mb-4">
              Быстрое сравнение
            </h2>
            <ComparisonTable dest={dest} />
          </section>

          {/* Разделы статьи */}
          {dest.sections.map((section, i) => (
            <section key={i} aria-labelledby={`section-${i}`} className="mt-12">
              <h2 id={`section-${i}`} className="text-2xl font-heading mb-4">
                {section.title}
              </h2>
              <p className="text-text/80 leading-relaxed">{section.content}</p>
            </section>
          ))}

          {/* FAQ */}
          <section aria-labelledby="faq-heading" className="mt-16">
            <h2 id="faq-heading" className="text-2xl font-heading mb-6">
              Часто задаваемые вопросы
            </h2>
            <dl className="space-y-6">
              {dest.faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-heading text-lg mb-2 text-text">
                    {item.question}
                  </dt>
                  <dd className="text-text/70 leading-relaxed">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Итог */}
          <section className="mt-16 border-t border-text/10 pt-8">
            <p className="text-text/50 text-sm">
              Надеемся, этот гид поможет спланировать ваше путешествие в{" "}
              {dest.name}. Следите за обновлениями — мы добавляем новые маршруты
              и советы каждый сезон.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
