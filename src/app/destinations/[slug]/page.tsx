import type { Metadata } from "next";
import type { Destination } from "../../../lib/types";
import Link from "next/link";

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

  {
    slug: "norway",
    name: "Норвегия",
    h1: "Путешествие в Norway: фьорды, Лофотены и северная Европа без компромиссов",
    quickAnswer:
      "Norway — одно из самых выразительных направлений северной Европы, где фьорды, арктические острова и горные маршруты формируют путешествие уровня полноценной экспедиции. Страна подходит как для luxury road trip, так и для самостоятельного hiking-маршрута через Лофотенские острова, Прекестулен и северные побережья.",
    bestSeason: "Июнь–сентябрь (лето), Сентябрь–март (северное сияние)",
    budget: "средний",
    difficulty: "среднее",
    forKids: true,
    safety: 5,
    sections: [
      {
        title: "Фьорды Norway: главная причина путешествия",
        content:
          "Фьорды остаются главным символом Norway travel. Глубокие заливы между отвесными скалами создают один из самых узнаваемых пейзажей Европы. Самые известные регионы: Geirangerfjord, Nærøyfjord, Lysefjord и Hardangerfjord. Лучший формат знакомства — road trip, ferry routes, panoramic railways и hiking expeditions. Именно западное побережье Norway формирует ту самую атмосферу северного expedition travel.",
      },
      {
        title: "Bergen и Oslo: два лица Norway",
        content:
          "Bergen считается столицей фьордов и главным стартом для western Norway маршрутов — старый порт, горные панорамы, fjord cruises и seafood culture. Oslo раскрывает другую сторону Norway: минималистичную и urban Nordic, со скандинавской архитектурой, музеями и Nordic gastronomy. Для большинства маршрутов оптимально комбинировать Oslo и western fjords в одном путешествии.",
      },
      {
        title: "Лофотенские острова: северная эстетика Norway",
        content:
          "Lofoten Islands — один из самых атмосферных регионов Scandinavia. Красные рыбацкие дома, арктические пляжи и резкие горные пики делают Лофотены культовым destination для photography и solo travel. Лучший сезон: июнь–август для midnight sun, сентябрь–март для northern lights. Основные активности: hiking, kayaking, Arctic road trips и fishing villages exploration. Несмотря на популярность, Лофотены всё ещё сохраняют ощущение удалённого северного архипелага.",
      },
      {
        title: "Прекестулен и hiking Norway",
        content:
          "Preikestolen — один из самых известных hiking-маршрутов Norway: скала над Lysefjord, около 8 км, средняя сложность, 4–5 часов. Для более серьёзных маршрутов путешественники выбирают Trolltunga, Kjeragbolten и Besseggen. Norway остаётся одним из лучших hiking-направлений Европы благодаря развитой инфраструктуре и высокому уровню безопасности маршрутов.",
      },
      {
        title: "Сколько стоит путешествие по Norway",
        content:
          "Norway относится к дорогим направлениям северной Европы. Средние расходы: hostel €50–90, hotel €180–350, аренда автомобиля €80–160 в день, ресторан €30–70. Для budget travel часто используют cabins, camping и самостоятельные road trips. Самые дорогие месяцы — июль и декабрь. Комфортный маршрут в среднем обходится в €200–350 в день.",
      },
    ],
    faq: [
      {
        question: "Когда лучше ехать в Norway?",
        answer:
          "Лето (июнь–сентябрь) — для фьордов, hiking и Лофотенских островов. Зима (сентябрь–март) — для northern lights. Оптимальный баланс цены и впечатлений — май и сентябрь: меньше туристов, природа в переходной фазе.",
      },
      {
        question: "Где лучше смотреть северное сияние в Norway?",
        answer:
          "Лучшие точки — Lofoten Islands и северные регионы страны. Важны ясное небо и удалённость от городской засветки. Оптимальное время наблюдения — между 21:00 и 02:00.",
      },
      {
        question: "Norway подходит для самостоятельного путешествия?",
        answer:
          "Да. Это одна из самых безопасных стран Европы для road trip и solo travel. Инфраструктура развита даже в удалённых регионах, маршруты хорошо размечены, транспортная система пунктуальна.",
      },
      {
        question: "Сколько стоит поездка в Norway?",
        answer:
          "Комфортный маршрут обычно стоит €200–350 в день на человека. Budget-формат с кемпингом и cabin — от €140 в день. Самые дорогие месяцы — июль и декабрь.",
      },
      {
        question: "Нужна ли машина в Norway?",
        answer:
          "Для фьордов и Лофотенских островов — практически обязательно. Аренда от €80 в день, обязательны winter tires в зимний период. Альтернатива — приватные трансферы или комбинация поездов и паромов.",
      },
    ],
  },

  {
    slug: "japan",
    name: "Япония",
    h1: "Путешествие в Japan: от мегаполисов до северных онсэнов",
    quickAnswer:
      "Japan — одно из самых многослойных travel-направлений мира, где ультрасовременные мегаполисы соседствуют с горными онсэнами, alpine-маршрутами и северными регионами без туристических толп. Страна подходит как для luxury travel, так и для самостоятельных railway-путешествий через Tokyo, Kyoto, Hokkaido и Tohoku.",
    bestSeason:
      "Март–апрель (сакура), Октябрь–ноябрь (осень), Декабрь–февраль (зима и онсэны)",
    budget: "средний",
    difficulty: "среднее",
    forKids: true,
    safety: 5,
    sections: [
      {
        title: "Tokyo и Kyoto: две стороны Japan",
        content:
          "Tokyo остаётся главным входом в современную Japan — город сочетает архитектуру будущего, premium shopping, минималистичные районы Shibuya, Ginza, Asakusa и Shinjuku. Особенно подходит для luxury travel, gastronomy и city photography. Kyoto раскрывает противоположную сторону Japan: древние храмы, ryokan culture, bamboo forests и tea districts. Именно контраст Tokyo и Kyoto формирует базовое понимание страны.",
      },
      {
        title: "Hokkaido и Tohoku: северная Japan без толп",
        content:
          "Север Japan — одна из самых недооценённых частей страны. Hokkaido и Tohoku предлагают winter landscapes, вулканические онсэны и railway-маршруты без перегруженных туристических потоков. Главные точки: Sapporo, Noboribetsu, Aomori, Ginzan Onsen и Lake Toya. Лучший сезон: декабрь–февраль для winter travel, октябрь — для autumn foliage. Именно северная Japan создаёт атмосферу slow expedition travel, почти исчезнувшую в популярных азиатских направлениях.",
      },
      {
        title: "Онсэны и японские Альпы",
        content:
          "Onsen culture — центральная часть путешествия по Japan. Горячие источники воспринимаются не как spa-формат, а как часть повседневной северной эстетики. Лучшие регионы: Hakone, Kusatsu, Noboribetsu и Japanese Alps. Главные hiking-маршруты: Kamikochi, Tateyama Kurobe и Takayama region. Летом регион подходит для trekking, зимой — для alpine snow travel.",
      },
      {
        title: "Japan Rail Pass и транспорт",
        content:
          "Japan Rail Pass остаётся одним из лучших способов перемещения по стране: доступ к shinkansen, быстрые long-distance routes и снижение расходов на intercity travel. Оптимальный маршрут: Tokyo → Kyoto → Alps → Hokkaido. Даже сами поездки на shinkansen становятся частью premium travel experience Japan.",
      },
      {
        title: "Сколько стоит путешествие по Japan",
        content:
          "Средние расходы: capsule hotel €35–60, standard hotel €120–220, premium ryokan €350–900, ресторан €15–60, Japan Rail Pass от €320. Наиболее дорогие сезоны — sakura season, Golden Week и новогодние праздники. Для budget travel выгоднее путешествовать в ноябре и феврале. Комфортный маршрут обычно требует €180–350 в день.",
      },
    ],
    faq: [
      {
        question: "Когда лучше ехать в Japan?",
        answer:
          "Весна (март–апрель) — для сакуры, осень (октябрь–ноябрь) — для mountain landscapes и красных лесов, зима (декабрь–февраль) — для Hokkaido, снежных онсэнов и winter travel. Для budget-маршрутов оптимальны ноябрь и февраль.",
      },
      {
        question: "Подходит ли Japan для solo travel?",
        answer:
          "Да. Это одно из самых безопасных направлений мира. Развитая инфраструктура, пунктуальный транспорт и культура уважения к личному пространству делают Japan идеальной страной для одиночных путешествий.",
      },
      {
        question: "Нужен ли Japan Rail Pass?",
        answer:
          "Для длинных маршрутов между регионами — практически обязательно. Особенно выгоден при маршруте Tokyo → Kyoto → Hokkaido. Покупать нужно до въезда в страну.",
      },
      {
        question: "Где лучше увидеть традиционную Japan?",
        answer:
          "Kyoto — главная точка для храмов и ryokan culture. Tohoku и mountain villages Japanese Alps предлагают более аутентичный и менее туристический опыт традиционной Japan.",
      },
      {
        question: "Сколько стоит поездка в Japan?",
        answer:
          "Комфортный маршрут обычно требует €180–350 в день. Budget-формат с capsule hotels и локальной едой — от €120 в день. Самые дорогие периоды: sakura season (конец марта — начало апреля) и Golden Week (начало мая).",
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
          <Link href="/" className="hover:text-primary transition-colors">
            Главная
          </Link>
          <span className="mx-2">/</span>
        </li>
        <li>
          <Link
            href="/destinations"
            className="hover:text-primary transition-colors"
          >
            Направления
          </Link>
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
