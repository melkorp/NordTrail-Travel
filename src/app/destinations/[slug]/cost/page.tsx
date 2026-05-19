// src/app/destinations/[slug]/cost/page.tsx
//
// СЕРВЕРНЫЙ КОМПОНЕНТ.
// Страница «Стоимость путешествия» для каждого направления.
// URL: /destinations/iceland/cost/
// Schema.org: FAQPage

import type { Metadata } from "next";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// ТИПЫ
// ─────────────────────────────────────────────────────────────
interface CostSection {
  title: string;
  content: string;
  items: { label: string; value: string }[];
}

interface BudgetRow {
  category: string;
  budget: string;
  comfort: string;
  premium: string;
}

interface CostFaq {
  q: string;
  a: string;
}

interface CostData {
  destinationSlug: string;
  destinationName: string;
  h1: string;
  quickAnswer: string;
  sections: CostSection[];
  budgetTable: BudgetRow[];
  faq: CostFaq[];
  summary: string;
}

// ─────────────────────────────────────────────────────────────
// ДАННЫЕ
// ─────────────────────────────────────────────────────────────
const COST_DATA: Record<string, CostData> = {
  iceland: {
    destinationSlug: "iceland",
    destinationName: "Исландия",
    h1: "Стоимость путешествия в Iceland в 2026",
    quickAnswer:
      "Iceland остаётся одним из самых дорогих travel-направлений Европы, однако уровень инфраструктуры, безопасности и уникальность ландшафтов делают расходы оправданными. В 2026 году комфортное путешествие по Исландии обычно требует €180–450 в день на человека в зависимости от сезона и формата маршрута.",
    sections: [
      {
        title: "Жильё в Iceland",
        content:
          "Размещение — одна из главных статей расходов во время Iceland travel. Летом цены увеличиваются на 30–60% из-за высокого сезона и ограниченной вместимости. Для budget Iceland travel многие выбирают cabins, farm stays и camping sites. Особенно выгодно бронировать жильё за 4–6 месяцев до поездки.",
        items: [
          { label: "Hostel bed", value: "€45–80" },
          { label: "Guesthouse", value: "€90–170" },
          { label: "Hotel 3–4*", value: "€220–450" },
          { label: "Luxury lodge", value: "€600+" },
        ],
      },
      {
        title: "Транспорт и road trip расходы",
        content:
          "Главный формат путешествия по Iceland — road trip. Общественный транспорт развит ограниченно, особенно вне Reykjavík. Для Highlands routes практически обязателен 4x4 vehicle. Полный Ring Road обычно занимает 7–12 дней. Зимой расходы возрастают из-за страховок и сложных погодных условий.",
        items: [
          { label: "Аренда small car", value: "€70–140/день" },
          { label: "4x4 SUV", value: "€140–280/день" },
          { label: "Бензин", value: "€2.2–2.7/литр" },
          { label: "Parking fees", value: "€5–20" },
        ],
      },
      {
        title: "Еда и рестораны",
        content:
          "Цены в Iceland заметно выше среднего европейского уровня. Для снижения бюджета путешественники часто покупают продукты в Bonus, готовят самостоятельно и используют guesthouse kitchens. Даже обычный grocery shopping в Iceland остаётся ощутимо дороже большинства стран Европы.",
        items: [
          { label: "Coffee + pastry", value: "€10–18" },
          { label: "Fast food", value: "€18–30" },
          { label: "Restaurant dinner", value: "€40–90" },
          { label: "Premium tasting menu", value: "€120–250" },
        ],
      },
      {
        title: "Экскурсии и активности",
        content:
          "Именно excursions формируют premium-часть Iceland travel. Многие путешественники комбинируют самостоятельный road trip с 1–2 крупными guided experiences. Наиболее дорогие форматы — helicopter tours, private photography expeditions и super jeep tours.",
        items: [
          { label: "Blue Lagoon", value: "€70–150" },
          { label: "Glacier hike", value: "€120–250" },
          { label: "Ice cave tour", value: "€160–320" },
          { label: "Whale watching", value: "€90–180" },
          { label: "Northern lights tour", value: "€80–170" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€45–120",
        comfort: "€180–350",
        premium: "€600+",
      },
      {
        category: "Транспорт",
        budget: "€70–120",
        comfort: "€140–220",
        premium: "€300+",
      },
      {
        category: "Еда",
        budget: "€25–50",
        comfort: "€60–120",
        premium: "€200+",
      },
      {
        category: "Экскурсии",
        budget: "€40–100",
        comfort: "€150–350",
        premium: "€600+",
      },
      {
        category: "Итог в день",
        budget: "€180–250",
        comfort: "€300–450",
        premium: "€900+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка в Iceland в 2026?",
        a: "Комфортное путешествие обычно требует €250–450 в день на человека. Budget-формат с camping и hostel — от €180 в день.",
      },
      {
        q: "Что самое дорогое в Iceland?",
        a: "Жильё и аренда автомобиля. Вместе они составляют 60–70% от общего бюджета поездки.",
      },
      {
        q: "Можно ли путешествовать бюджетно?",
        a: "Да, при использовании camping, hostels и самостоятельного road trip. Покупки в супермаркете Bonus и guesthouse kitchen значительно снижают расходы на питание.",
      },
      {
        q: "Когда цены самые высокие?",
        a: "Июнь–август и новогодние праздники. Летом цены на жильё вырастают на 30–60% относительно межсезонья.",
      },
      {
        q: "Нужен ли автомобиль?",
        a: "Для полноценного Iceland travel — практически обязательно. Без машины доступны только Reykjavík и ближайшие экскурсии.",
      },
    ],
    summary:
      "Iceland в 2026 году остаётся дорогим, но уникальным направлением, где расходы напрямую связаны с уровнем впечатлений: glacier expeditions, volcanic roads и Arctic landscapes невозможно сравнить с обычным европейским travel. Именно сочетание road trip свободы, северной природы и premium expedition atmosphere делает Iceland одним из самых сильных travel-направлений современного Севера.",
  },

  norway: {
    destinationSlug: "norway",
    destinationName: "Норвегия",
    h1: "Стоимость путешествия в Norway в 2026",
    quickAnswer:
      "Норвегия — одно из самых дорогих travel-направлений северной Европы. Комфортное путешествие обычно требует €200–400 в день. Основные расходы приходятся на жильё, транспорт и питание. Budget-формат с camping и самостоятельным road trip позволяет снизить расходы до €140 в день.",
    sections: [
      {
        title: "Жильё в Norway",
        content:
          "Размещение — главная статья расходов. Цены варьируются от кемпингов до luxury lodge. Бронирование за 3–5 месяцев даёт лучшие цены.",
        items: [
          { label: "Hostel", value: "€50–90" },
          { label: "Guesthouse", value: "€120–200" },
          { label: "Hotel 3–4*", value: "€180–350" },
          { label: "Luxury lodge", value: "€500+" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Road trip — главный формат путешествия по Норвегии. Аренда авто обязательна для фьордов и Лофотенских островов. Паромы и туннели добавляют расходы.",
        items: [
          { label: "Аренда авто", value: "€80–160/день" },
          { label: "Бензин", value: "€2.3–2.8/литр" },
          { label: "Паромы", value: "€20–80" },
          { label: "Поезда", value: "€30–100" },
        ],
      },
      {
        title: "Еда и рестораны",
        content:
          "Норвежские рестораны дороги. Местные жители часто готовят дома. Супермаркеты Kiwi и Rema 1000 — выбор budget travelers.",
        items: [
          { label: "Кофе + выпечка", value: "€8–15" },
          { label: "Fast food", value: "€15–25" },
          { label: "Ресторан", value: "€35–80" },
          { label: "Fine dining", value: "€120–250" },
        ],
      },
      {
        title: "Активности и excursions",
        content:
          "Фьорды, ледники и northern lights tours формируют premium-часть бюджета. Многие треккинговые маршруты бесплатны.",
        items: [
          { label: "Fjord cruise", value: "€50–120" },
          { label: "Glacier hike", value: "€100–200" },
          { label: "Northern lights tour", value: "€80–170" },
          { label: "Whale watching", value: "€90–180" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€50–120",
        comfort: "€180–350",
        premium: "€500+",
      },
      {
        category: "Транспорт",
        budget: "€80–120",
        comfort: "€140–220",
        premium: "€300+",
      },
      {
        category: "Еда",
        budget: "€25–50",
        comfort: "€60–120",
        premium: "€200+",
      },
      {
        category: "Активности",
        budget: "€30–80",
        comfort: "€120–250",
        premium: "€500+",
      },
      {
        category: "Итог в день",
        budget: "€140–250",
        comfort: "€250–400",
        premium: "€800+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка в Norway?",
        a: "Комфортное путешествие — €250–400 в день. Budget-формат с camping — от €140 в день.",
      },
      {
        q: "Что самое дорогое?",
        a: "Жильё и аренда автомобиля. Вместе они составляют 60–70% бюджета.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: camping, cabins, самостоятельная готовка и раннее бронирование.",
      },
      {
        q: "Когда цены ниже?",
        a: "Май, сентябрь и октябрь. Летом и в декабре цены максимальны.",
      },
      {
        q: "Нужна ли машина?",
        a: "Для фьордов и Лофотен — обязательно. Аренда от €80 в день.",
      },
    ],
    summary:
      "Норвегия — дорогое, но оправданное направление: фьорды, ледники и северное сияние создают впечатления, несравнимые с обычным европейским travel. Грамотное планирование позволяет пройти по грани между комфортом и бюджетом.",
  },

  japan: {
    destinationSlug: "japan",
    destinationName: "Япония",
    h1: "Стоимость путешествия в Japan в 2026",
    quickAnswer:
      "Япония — направление с широким диапазоном бюджета: от бюджетных capsule hotels до премиальных рёканов. Комфортное путешествие требует €180–350 в день. Основные расходы: жильё, Japan Rail Pass и питание. Бюджетный формат с hostel и локальной едой — от €120 в день.",
    sections: [
      {
        title: "Жильё в Japan",
        content:
          "Размещение варьируется от капсульных отелей до традиционных рёканов с онсэнами. Цены сильно зависят от сезона: сакура и Golden Week — пиковые.",
        items: [
          { label: "Capsule hotel", value: "€35–60" },
          { label: "Business hotel", value: "€80–150" },
          { label: "Standard hotel", value: "€120–220" },
          { label: "Premium ryokan", value: "€350–900" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Japan Rail Pass — ключевой элемент бюджета для intercity travel. Местный транспорт в городах дёшев и эффективен.",
        items: [
          { label: "JR Pass (7 дней)", value: "€320" },
          { label: "Shinkansen Tokyo–Kyoto", value: "€100–130" },
          { label: "Метро (день)", value: "€5–10" },
          { label: "Автобус (междугородний)", value: "€20–50" },
        ],
      },
      {
        title: "Еда и рестораны",
        content:
          "Япония предлагает широкий ценовой диапазон: от уличной еды до Michelin-ресторанов. Convenience stores (7-Eleven, Lawson) — спасение для budget travelers.",
        items: [
          { label: "Ramen/udon", value: "€6–12" },
          { label: "Sushi set", value: "€15–40" },
          { label: "Izakaya ужин", value: "€25–50" },
          { label: "Kaiseki (премиум)", value: "€100–300" },
        ],
      },
      {
        title: "Достопримечательности",
        content:
          "Храмы, музеи и природные парки имеют умеренную стоимость. Многие храмовые комплексы бесплатны.",
        items: [
          { label: "Храмы Kyoto", value: "€3–8" },
          { label: "Музеи Tokyo", value: "€8–20" },
          { label: "Onsen (общественный)", value: "€5–15" },
          { label: "Fuji climbing", value: "€0–30" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€35–80",
        comfort: "€120–250",
        premium: "€350+",
      },
      {
        category: "Транспорт",
        budget: "€20–50",
        comfort: "€50–100",
        premium: "€150+",
      },
      {
        category: "Еда",
        budget: "€20–40",
        comfort: "€50–100",
        premium: "€200+",
      },
      {
        category: "Активности",
        budget: "€10–30",
        comfort: "€40–100",
        premium: "€200+",
      },
      {
        category: "Итог в день",
        budget: "€120–180",
        comfort: "€200–350",
        premium: "€600+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка в Японию?",
        a: "Комфортное путешествие — €200–350 в день. Budget-формат — от €120 в день.",
      },
      {
        q: "Что самое дорогое?",
        a: "Жильё и междугородний транспорт. JR Pass окупается при 2+ поездках на shinkansen.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: capsule hotels, convenience store еда, локальные поезда вместо shinkansen.",
      },
      {
        q: "Когда цены ниже?",
        a: "Ноябрь и февраль. Избегайте sakura season (март–апрель) и Golden Week (май).",
      },
      {
        q: "Нужен ли JR Pass?",
        a: "Для маршрутов Tokyo–Kyoto–Hokkaido — практически обязателен. Покупать до въезда.",
      },
    ],
    summary:
      "Япония предлагает уникальный баланс: от ультрабюджетного travel с capsule hotels до премиальных рёканов с онсэнами. Ключ к оптимальному бюджету — раннее планирование и JR Pass.",
  },

  georgia: {
    destinationSlug: "georgia",
    destinationName: "Грузия",
    h1: "Стоимость путешествия в Georgia в 2026",
    quickAnswer:
      "Грузия — одно из самых доступных mountain travel-направлений Евразии. Комфортное путешествие обычно требует €60–120 в день. Основные расходы: жильё, транспорт по горам и питание. Budget-формат с guesthouse и локальной едой — от €35 в день.",
    sections: [
      {
        title: "Жильё в Georgia",
        content:
          "Грузия предлагает отличное соотношение цены и качества размещения. Guesthouse с домашним завтраком — визитная карточка страны.",
        items: [
          { label: "Guesthouse", value: "€25–60" },
          { label: "Boutique hotel", value: "€90–180" },
          { label: "Mountain lodge", value: "€50–120" },
          { label: "Premium Tbilisi", value: "€150–300" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Маршрутки — основной бюджетный транспорт. Для горных районов (Сванетия, Казбек) нужен внедорожник или организованный трансфер.",
        items: [
          { label: "Маршрутка (междугородняя)", value: "€5–15" },
          { label: "Аренда внедорожника", value: "€70–140/день" },
          { label: "Такси по Tbilisi", value: "€3–8" },
          { label: "Трансфер в горы", value: "€30–80" },
        ],
      },
      {
        title: "Еда и вино",
        content:
          "Грузинская кухня — одна из главных причин путешествия. Цены в ресторанах значительно ниже европейских.",
        items: [
          { label: "Хинкали (5 шт)", value: "€3–6" },
          { label: "Хачапури", value: "€4–10" },
          { label: "Ужин с вином", value: "€12–25" },
          { label: "Винный тур", value: "€30–80" },
        ],
      },
      {
        title: "Активности и горы",
        content:
          "Треккинг в Сванетии и Казбеке в основном бесплатен. Организованные туры добавляют комфорта и безопасности.",
        items: [
          { label: "Треккинг (самостоятельно)", value: "€0–10" },
          { label: "Гид на Казбек", value: "€50–120" },
          { label: "Конный тур", value: "€30–70" },
          { label: "Gudauri ski pass", value: "€20–40/день" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€25–60",
        comfort: "€90–180",
        premium: "€200+",
      },
      {
        category: "Транспорт",
        budget: "€10–30",
        comfort: "€40–80",
        premium: "€150+",
      },
      {
        category: "Еда",
        budget: "€15–25",
        comfort: "€30–60",
        premium: "€100+",
      },
      {
        category: "Активности",
        budget: "€10–30",
        comfort: "€50–120",
        premium: "€200+",
      },
      {
        category: "Итог в день",
        budget: "€35–60",
        comfort: "€80–150",
        premium: "€300+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка в Грузию?",
        a: "Комфортное путешествие — €80–150 в день. Budget-формат — от €35 в день.",
      },
      {
        q: "Что самое дорогое?",
        a: "Трансферы в горы и аренда внедорожника для Сванетии.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: guesthouse, маршрутки, локальная еда. Одно из самых доступных mountain направлений.",
      },
      {
        q: "Когда цены ниже?",
        a: "Весна (апрель–май) и осень (октябрь–ноябрь). Летом цены в горах растут.",
      },
      {
        q: "Нужна ли машина?",
        a: "Для Сванетии и удалённых районов — желательно. Tbilisi–Kazbegi доступен маршрутками.",
      },
    ],
    summary:
      "Грузия — лучшее mountain travel-направление по соотношению цена/впечатления. Горы, вино и кухня доступны даже при минимальном бюджете.",
  },

  alps: {
    destinationSlug: "alps",
    destinationName: "Альпы",
    h1: "Стоимость путешествия в Alps в 2026",
    quickAnswer:
      "Альпы — один из самых дорогих mountain-регионов Европы, особенно Switzerland. Комфортное путешествие требует €250–500 в день. Основные расходы: ski pass, mountain lodging и питание. Budget-формат с mountain huts и regional trains — от €150 в день.",
    sections: [
      {
        title: "Жильё в Alps",
        content:
          "Цены сильно варьируются по странам: Switzerland — самые дорогие, France и Italy — умереннее. Mountain huts — бюджетная альтернатива.",
        items: [
          { label: "Mountain hut", value: "€50–90" },
          { label: "Hotel 3*", value: "€180–350" },
          { label: "Chalet (апартаменты)", value: "€250–600" },
          { label: "Luxury resort", value: "€800+" },
        ],
      },
      {
        title: "Ski pass и зимний спорт",
        content:
          "Ski pass — крупнейшая статья зимнего бюджета. Цены зависят от региона и сезона.",
        items: [
          { label: "Ski pass (день)", value: "€60–100" },
          { label: "Аренда лыж (день)", value: "€40–80" },
          { label: "Урок с инструктором", value: "€80–150" },
          { label: "Heli-ski (день)", value: "€500+" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Альпийские поезда — часть впечатлений. Glacier Express и Bernina Express — премиум-опыт. Regional trains доступнее.",
        items: [
          { label: "Regional train", value: "€20–50" },
          { label: "Glacier Express", value: "€150–250" },
          { label: "Аренда авто", value: "€80–160/день" },
          { label: "Канатные дороги", value: "€20–60" },
        ],
      },
      {
        title: "Еда и рестораны",
        content:
          "Горные рестораны дороже городских. Fondue и raclette — must-try, но дорого. Supermarket Coop и Migros — выбор budget.",
        items: [
          { label: "Завтрак в кафе", value: "€12–25" },
          { label: "Обед на склоне", value: "€20–40" },
          { label: "Ужин с fondue", value: "€35–70" },
          { label: "Fine dining", value: "€120–300" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€50–100",
        comfort: "€180–400",
        premium: "€800+",
      },
      {
        category: "Ski pass",
        budget: "€0–60",
        comfort: "€60–100",
        premium: "€150+",
      },
      {
        category: "Транспорт",
        budget: "€20–50",
        comfort: "€60–120",
        premium: "€200+",
      },
      {
        category: "Еда",
        budget: "€30–60",
        comfort: "€70–150",
        premium: "€300+",
      },
      {
        category: "Итог в день",
        budget: "€150–250",
        comfort: "€300–500",
        premium: "€1000+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка в Альпы?",
        a: "Комфортное путешествие — €300–500 в день. Budget — от €150 с mountain huts.",
      },
      {
        q: "Что самое дорогое?",
        a: "Ski pass и жильё в высокий сезон. Switzerland дороже France и Italy на 40–60%.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: mountain huts, regional trains, supermarket еда. Летний trekking дешевле зимнего ski.",
      },
      {
        q: "Когда цены ниже?",
        a: "Апрель, май, октябрь–ноябрь. Февраль и август — пиковые.",
      },
      {
        q: "Нужна ли машина?",
        a: "Необязательно. Поезда покрывают большинство курортов. Для remote valleys — желательно.",
      },
    ],
    summary:
      "Альпы — регион, где цена прямо пропорциональна впечатлениям: glacier trains, панорамные спуски и alpine cuisine оправдывают высокий бюджет. Грамотное планирование сезона снижает расходы на 30–40%.",
  },

  kamchatka: {
    destinationSlug: "kamchatka",
    destinationName: "Камчатка",
    h1: "Стоимость путешествия на Камчатку в 2026",
    quickAnswer:
      "Камчатка — одно из самых дорогих expedition-направлений России из-за вертолётной логистики и удалённости. Комфортное путешествие требует €250–600+ в день. Основные расходы: вертолётные туры, транспорт и организация экспедиций. Budget-формат с самостоятельным trekking — от €180 в день.",
    sections: [
      {
        title: "Авиабилеты и логистика",
        content:
          "Перелёт на Камчатку — первая крупная статья расходов. Прямые рейсы из Москвы занимают 8–9 часов.",
        items: [
          { label: "Авиабилет Москва–П-Камчатский", value: "€350–800" },
          { label: "Багаж (снаряжение)", value: "€30–80" },
          { label: "Трансфер аэропорт–город", value: "€15–30" },
        ],
      },
      {
        title: "Вертолётные туры",
        content:
          "Вертолёт — основной транспорт для удалённых маршрутов. Это самая дорогая часть путешествия.",
        items: [
          { label: "Долина гейзеров (день)", value: "€350–600" },
          { label: "Heli-ski (день)", value: "€700–1200" },
          { label: "Курильское озеро (медведи)", value: "€400–700" },
          { label: "Вулканы (обзорный)", value: "€250–450" },
        ],
      },
      {
        title: "Проживание",
        content:
          "Гостиницы в Петропавловске-Камчатском и expedition lodges. В удалённых районах — палатки и базовые лагеря.",
        items: [
          { label: "Hostel/guesthouse", value: "€30–60" },
          { label: "Гостиница 3*", value: "€80–180" },
          { label: "Expedition lodge", value: "€200–500" },
          { label: "Палатка/кемпинг", value: "€0–10" },
        ],
      },
      {
        title: "Треккинг и активности",
        content:
          "Самостоятельные восхождения на Авачинский и Мутновский вулканы бесплатны. Организованные туры добавляют безопасности и комфорта.",
        items: [
          { label: "Гид на вулкан (день)", value: "€80–200" },
          { label: "Морская прогулка", value: "€100–250" },
          { label: "Снаряжение (аренда)", value: "€20–50/день" },
          { label: "Термальные источники", value: "€10–30" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Авиабилеты",
        budget: "€350",
        comfort: "€500",
        premium: "€800+",
      },
      {
        category: "Вертолёты",
        budget: "€0–350",
        comfort: "€400–800",
        premium: "€1200+",
      },
      {
        category: "Жильё",
        budget: "€30–60",
        comfort: "€80–200",
        premium: "€300+",
      },
      {
        category: "Активности",
        budget: "€50–150",
        comfort: "€200–500",
        premium: "€800+",
      },
      {
        category: "Итог в день",
        budget: "€180–300",
        comfort: "€350–600",
        premium: "€1000+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка на Камчатку?",
        a: "Экспедиция с вертолётами — €350–600 в день. Самостоятельный trekking — от €180 в день.",
      },
      {
        q: "Почему так дорого?",
        a: "Вертолётные туры, удалённость региона и ограниченная инфраструктура.",
      },
      {
        q: "Можно ли без вертолётов?",
        a: "Да: Авачинский и Мутновский вулканы доступны пешком. Долина гейзеров — только вертолётом.",
      },
      {
        q: "Когда цены ниже?",
        a: "Осень (октябрь–ноябрь) и весна (апрель–май). Летом и в сезон heli-ski цены максимальны.",
      },
      {
        q: "Нужен ли гид?",
        a: "Для удалённых маршрутов — обязательно. Для базовых вулканов — рекомендуется.",
      },
    ],
    summary:
      "Камчатка — expedition-направление, где бюджет напрямую определяет доступ к удалённым точкам. Вертолётные туры стоят дорого, но открывают территории, не имеющие аналогов в России.",
  },

  kola: {
    destinationSlug: "kola",
    destinationName: "Кольский полуостров",
    h1: "Стоимость путешествия на Кольский полуостров в 2026",
    quickAnswer:
      "Кольский полуостров — одно из самых доступных арктических направлений России. Комфортное путешествие требует €100–200 в день. Основные расходы: транспорт, жильё и экскурсии за северным сиянием. Budget-формат с самостоятельным треккингом — от €60 в день.",
    sections: [
      {
        title: "Жильё",
        content:
          "Мурманск предлагает широкий выбор размещения. Териберка и Хибины — ограниченный, но атмосферный private sector.",
        items: [
          { label: "Hostel", value: "€15–30" },
          { label: "Guesthouse", value: "€35–70" },
          { label: "Hotel 3*", value: "€60–120" },
          { label: "База отдыха в Хибинах", value: "€80–180" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Поезд Москва–Мурманск — бюджетный вариант. Для Териберки и Хибин нужен автомобиль или тур.",
        items: [
          { label: "Поезд Москва–Мурманск", value: "€60–120" },
          { label: "Авиабилет", value: "€100–250" },
          { label: "Тур в Териберку", value: "€50–100" },
          { label: "Аренда авто", value: "€50–100/день" },
        ],
      },
      {
        title: "Экскурсии и активности",
        content:
          "Охота за северным сиянием — главная активность. Киты и snowmobile tours добавляют впечатлений.",
        items: [
          { label: "Northern lights tour", value: "€40–100" },
          { label: "Whale watching", value: "€60–150" },
          { label: "Snowmobile (день)", value: "€100–250" },
          { label: "Хибины trekking", value: "€0–30" },
        ],
      },
      {
        title: "Еда",
        content:
          "Мурманск предлагает арктическую кухню: краб, оленина, морская рыба. Цены умеренные.",
        items: [
          { label: "Обед в кафе", value: "€8–15" },
          { label: "Ужин с морепродуктами", value: "€20–40" },
          { label: "Краб (комплексный)", value: "€30–60" },
          { label: "Продукты в супермаркете", value: "€10–20/день" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€15–40",
        comfort: "€60–120",
        premium: "€180+",
      },
      {
        category: "Транспорт",
        budget: "€20–50",
        comfort: "€60–120",
        premium: "€200+",
      },
      {
        category: "Еда",
        budget: "€15–25",
        comfort: "€30–60",
        premium: "€100+",
      },
      {
        category: "Активности",
        budget: "€10–50",
        comfort: "€60–150",
        premium: "€300+",
      },
      {
        category: "Итог в день",
        budget: "€60–100",
        comfort: "€120–200",
        premium: "€400+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка на Кольский?",
        a: "Комфортное путешествие — €120–200 в день. Budget — от €60 в день.",
      },
      {
        q: "Что самое дорогое?",
        a: "Экскурсии (whale watching, snowmobile) и трансферы в Териберку.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: поезд, hostel, самостоятельный треккинг в Хибинах.",
      },
      {
        q: "Когда цены ниже?",
        a: "Лето (июнь–август). Зимой цены на туры растут из-за спроса на northern lights.",
      },
      {
        q: "Нужна ли машина?",
        a: "Для Териберки и Хибин — желательно. Альтернатива — организованные туры из Мурманска.",
      },
    ],
    summary:
      "Кольский полуостров — доступная Арктика: северное сияние, киты и Хибины при умеренном бюджете. Отличный выбор для первого арктического опыта.",
  },

  altai: {
    destinationSlug: "altai",
    destinationName: "Алтай",
    h1: "Стоимость путешествия на Алтай в 2026",
    quickAnswer:
      "Алтай — одно из самых доступных mountain travel-направлений России. Комфортное путешествие требует €80–180 в день. Основные расходы: трансферы, жильё и питание. Budget-формат с палаткой и самостоятельным trekking — от €40 в день.",
    sections: [
      {
        title: "Жильё",
        content:
          "Guesthouse и турбазы — основной формат размещения. Цены значительно ниже европейских аналогов.",
        items: [
          { label: "Палатка/кемпинг", value: "€0–5" },
          { label: "Guesthouse", value: "€25–60" },
          { label: "Турбаза", value: "€50–100" },
          { label: "Mountain lodge", value: "€90–180" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Чуйский тракт — главная артерия Алтая. Для удалённых районов нужен внедорожник. Местные маршрутки дёшевы, но нерегулярны.",
        items: [
          { label: "Аренда внедорожника", value: "€70–140/день" },
          { label: "Маршрутка", value: "€5–20" },
          { label: "Трансфер в горы", value: "€30–80" },
          { label: "Бензин", value: "€0.7–0.9/литр" },
        ],
      },
      {
        title: "Еда",
        content:
          "Алтайская кухня проста и доступна. Мараловодческие хозяйства предлагают уникальные local products.",
        items: [
          { label: "Обед в кафе", value: "€6–12" },
          { label: "Ужин на турбазе", value: "€10–20" },
          { label: "Продукты (день)", value: "€8–15" },
          { label: "Марал (панты, мёд)", value: "€10–30" },
        ],
      },
      {
        title: "Активности",
        content:
          "Треккинг к Белухе и Мультинским озёрам в основном бесплатен. Конные туры и organised expeditions добавляют комфорта.",
        items: [
          { label: "Треккинг (самостоятельно)", value: "€0–10" },
          { label: "Конный тур (день)", value: "€30–70" },
          { label: "Гид на Белуху", value: "€80–200" },
          { label: "Сплав (день)", value: "€40–100" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€5–30",
        comfort: "€50–100",
        premium: "€180+",
      },
      {
        category: "Транспорт",
        budget: "€10–30",
        comfort: "€40–80",
        premium: "€150+",
      },
      { category: "Еда", budget: "€10–20", comfort: "€25–40", premium: "€80+" },
      {
        category: "Активности",
        budget: "€10–30",
        comfort: "€50–100",
        premium: "€200+",
      },
      {
        category: "Итог в день",
        budget: "€40–70",
        comfort: "€80–150",
        premium: "€300+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка на Алтай?",
        a: "Комфортное путешествие — €80–150 в день. Budget — от €40 в день.",
      },
      {
        q: "Что самое дорогое?",
        a: "Аренда внедорожника и organised expeditions к Белухе.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: палатка, маршрутки, самостоятельный trekking. Одно из самых доступных mountain направлений.",
      },
      {
        q: "Когда цены ниже?",
        a: "Весна (апрель–май) и осень (октябрь). Летом цены на турбазах растут.",
      },
      {
        q: "Нужна ли машина?",
        a: "Для Чуйского тракта и удалённых районов — желательно. Для базовых точек ходят маршрутки.",
      },
    ],
    summary:
      "Алтай — лучшее mountain travel-направление России по соотношению цена/впечатления. Горы, ледники и Чуйский тракт доступны даже при минимальном бюджете.",
  },

  baikal: {
    destinationSlug: "baikal",
    destinationName: "Байкал",
    h1: "Стоимость путешествия на Байкал в 2026",
    quickAnswer:
      "Байкал — доступное expedition-направление России. Комфортное путешествие требует €80–200 в день. Основные расходы: трансферы на Ольхон, жильё и зимние экскурсии. Budget-формат с самостоятельным trekking — от €50 в день.",
    sections: [
      {
        title: "Жильё",
        content:
          "На Ольхоне и в Листвянке — guesthouse и турбазы. Зимой цены ниже, но выбор ограничен.",
        items: [
          { label: "Guesthouse", value: "€25–60" },
          { label: "Турбаза", value: "€40–100" },
          { label: "Hotel 3*", value: "€80–180" },
          { label: "Палатка (лето)", value: "€0–5" },
        ],
      },
      {
        title: "Транспорт",
        content:
          "Поезд Москва–Иркутск — бюджетный вариант. Хивус (судно на воздушной подушке) — главный зимний транспорт на Ольхон.",
        items: [
          { label: "Авиабилет Москва–Иркутск", value: "€200–500" },
          { label: "Поезд (плацкарт/купе)", value: "€80–200" },
          { label: "Хивус на Ольхон (зима)", value: "€10–20" },
          { label: "Паром на Ольхон (лето)", value: "€5–10" },
        ],
      },
      {
        title: "Экскурсии и лёд",
        content:
          "Ледовые экспедиции — главная winter active. Летом популярны boat tours и trekking по Большой Байкальской тропе.",
        items: [
          { label: "Ледовый тур (день)", value: "€40–120" },
          { label: "Хивус-экспедиция", value: "€60–150" },
          { label: "Boat tour (лето)", value: "€30–80" },
          { label: "Гид по Ольхону", value: "€40–100" },
        ],
      },
      {
        title: "Еда",
        content:
          "Байкальская кухня: омуль, позы (буузы), таёжный чай. Цены умеренные, особенно вне туристических точек.",
        items: [
          { label: "Обед в кафе", value: "€6–12" },
          { label: "Омуль горячего копчения", value: "€5–10" },
          { label: "Ужин на турбазе", value: "€10–20" },
          { label: "Продукты (день)", value: "€8–15" },
        ],
      },
    ],
    budgetTable: [
      {
        category: "Жильё",
        budget: "€5–40",
        comfort: "€50–120",
        premium: "€180+",
      },
      {
        category: "Транспорт",
        budget: "€10–30",
        comfort: "€40–80",
        premium: "€150+",
      },
      { category: "Еда", budget: "€10–20", comfort: "€25–40", premium: "€80+" },
      {
        category: "Экскурсии",
        budget: "€10–40",
        comfort: "€50–120",
        premium: "€200+",
      },
      {
        category: "Итог в день",
        budget: "€50–80",
        comfort: "€100–200",
        premium: "€350+",
      },
    ],
    faq: [
      {
        q: "Сколько стоит поездка на Байкал?",
        a: "Комфортное путешествие — €100–200 в день. Budget — от €50 в день.",
      },
      {
        q: "Что самое дорогое?",
        a: "Зимние ледовые экспедиции и трансферы на хивусе.",
      },
      {
        q: "Можно ли бюджетно?",
        a: "Да: палатка летом, поезд, самостоятельный trekking по ББТ.",
      },
      {
        q: "Когда цены ниже?",
        a: "Весна (апрель–май) и осень (октябрь). Февраль–март — пик ледового сезона.",
      },
      {
        q: "Нужна ли машина?",
        a: "Для Ольхона — необязательно. Для remote routes по побережью — желательно.",
      },
    ],
    summary:
      "Байкал — уникальное направление, где зимний лёд и летний trekking доступны при умеренном бюджете. Отличный выбор для первой сибирской экспедиции.",
  },
};

// ─────────────────────────────────────────────────────────────
// generateStaticParams
// ─────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return Object.keys(COST_DATA).map((slug) => ({ slug }));
}

// ─────────────────────────────────────────────────────────────
// generateMetadata
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = COST_DATA[slug];

  if (!data) return { title: "Страница не найдена | NordTrail Travel" };

  return {
    title: `${data.h1} | NordTrail Travel`,
    description: data.quickAnswer.slice(0, 160),
    alternates: {
      canonical: `/destinations/${slug}/cost/`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Schema.org JSON-LD
// ─────────────────────────────────────────────────────────────
function JsonLd({ data }: { data: CostData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
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

// ─────────────────────────────────────────────────────────────
// СТРАНИЦА
// ─────────────────────────────────────────────────────────────
export default async function CostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = COST_DATA[slug];

  if (!data) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text text-xl">Страница не найдена</p>
      </main>
    );
  }

  return (
    <>
      <JsonLd data={data} />

      <main className="min-h-screen bg-bg text-text">
        {/* ── Хедер ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-10 pt-20">
          {/* Хлебные крошки */}
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <Link
              href="/"
              className="transition-colors hover:text-accent-bright"
            >
              NordTrail
            </Link>
            <span>/</span>
            <Link
              href="/destinations/"
              className="transition-colors hover:text-accent-bright"
            >
              Направления
            </Link>
            <span>/</span>
            <Link
              href={`/destinations/${slug}/`}
              className="transition-colors hover:text-accent-bright"
            >
              {data.destinationName}
            </Link>
            <span>/</span>
            <span className="text-text/70">Стоимость</span>
          </nav>

          {/* H1 */}
          <h1 className="font-heading text-3xl font-bold leading-tight text-text sm:text-4xl">
            {data.h1}
          </h1>
          <div className="mt-3 h-px w-24 bg-linear-to-r from-accent-bright to-accent-calm" />

          {/* Quick Answer */}
          <div className="mt-6 rounded-2xl border border-accent-bright/20 bg-accent-bright/5 p-5">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent-bright">
              Кратко
            </p>
            <p className="text-base leading-relaxed text-text/80">
              {data.quickAnswer}
            </p>
          </div>
        </section>

        {/* ── Секции расходов ───────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-14">
          <h2 className="mb-6 font-heading text-xl font-bold text-text">
            Детальный разбор расходов
          </h2>

          <div className="space-y-4">
            {data.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-text/8 bg-surface/30 p-6 transition-all duration-300 hover:border-accent-bright/30 hover:bg-surface/50"
              >
                <h3 className="mb-3 font-heading text-lg font-bold text-text">
                  {section.title}
                </h3>

                <p className="mb-4 text-sm leading-relaxed text-text-muted">
                  {section.content}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-text/6 bg-bg/60 px-3 py-2.5"
                    >
                      <p className="text-xs text-text-muted mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-accent-bright">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Budget Table ──────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-14">
          <h2 className="mb-5 font-heading text-xl font-bold text-text">
            Бюджет по форматам путешествия
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-text/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-text/8 bg-surface/40">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                    Категория
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-accent-calm">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-accent-bright">
                    Comfort
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-accent-bright">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.budgetTable.map((row, i) => {
                  const isTotal = i === data.budgetTable.length - 1;
                  return (
                    <tr
                      key={row.category}
                      className={`border-b border-text/5 transition-colors hover:bg-surface/20 ${
                        isTotal
                          ? "bg-surface/30 font-medium"
                          : i % 2 === 0
                            ? "bg-transparent"
                            : "bg-surface/10"
                      }`}
                    >
                      <td
                        className={`px-4 py-3 ${
                          isTotal ? "text-text font-semibold" : "text-text/80"
                        }`}
                      >
                        {row.category}
                      </td>
                      <td className="px-4 py-3 text-accent-calm">
                        {row.budget}
                      </td>
                      <td className="px-4 py-3 text-accent-bright">
                        {row.comfort}
                      </td>
                      <td className="px-4 py-3 text-accent-bright">
                        {row.premium}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-14">
          <h2 className="mb-5 font-heading text-xl font-bold text-text">
            Частые вопросы
          </h2>

          <div className="space-y-3">
            {data.faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-text/8 bg-surface/20 p-5"
              >
                <p className="mb-2 font-heading font-bold text-text">
                  {item.q}
                </p>
                <p className="text-sm leading-relaxed text-text-muted">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Summary ──────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-2xl border border-accent-bright/20 bg-accent-bright/4 p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent-bright">
              Итог
            </p>
            <p className="text-base leading-relaxed text-text/80">
              {data.summary}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/destinations/${slug}/`}
              className="inline-flex items-center gap-2 text-sm text-accent-bright/70 transition-colors hover:text-accent-bright"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M10 6H2M5 9L2 6l3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Вернуться к {data.destinationName}
            </Link>
            <Link
              href={`/destinations/${slug}/best-time/`}
              className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-bright"
            >
              Лучшее время для посещения
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8M7 3l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
