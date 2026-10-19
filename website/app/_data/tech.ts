export interface TechMeta {
  slug: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  seoTitleRu: string;
  seoDescRu: string;
  seoTitleEn: string;
  seoDescEn: string;
  featuresRu: string[];
  featuresEn: string[];
}

export const TECH_STACK: TechMeta[] = [
  {
    slug: "1c",
    titleRu: "Разработка на 1С",
    titleEn: "1C Development",
    descRu: "Автоматизация бизнес-процессов, доработка типовых конфигураций и интеграция 1С с внешними системами.",
    descEn: "Business process automation, customization of standard configurations, and 1C integration with external systems.",
    seoTitleRu: "Разработка и внедрение 1С на заказ | Rovno.dev",
    seoDescRu: "Профессиональная разработка на 1С: автоматизация, интеграции, доработка конфигураций. Опытная команда, прозрачные сроки.",
    seoTitleEn: "Custom 1C Development & Integration | Rovno.dev",
    seoDescEn: "Professional 1C development: automation, integrations, configuration customization. Experienced team, transparent timelines.",
    featuresRu: [
      "Доработка конфигураций УТ, ЗУП, ERP",
      "Интеграция с сайтами, CRM и платежными системами",
      "Разработка внешних отчетов и обработок",
      "Оптимизация производительности баз данных",
    ],
    featuresEn: [
      "Customization of UT, ZUP, ERP configurations",
      "Integration with websites, CRMs, and payment systems",
      "Development of external reports and data processors",
      "Database performance optimization",
    ],
  },
  {
    slug: "python",
    titleRu: "Разработка на Python",
    titleEn: "Python Development",
    descRu: "Разработка бэкенда, парсеров, систем автоматизации и ИИ-сервисов на базе FastAPI, Django и популярных ML-библиотек.",
    descEn: "Backend development, parsers, automation systems, and AI services based on FastAPI, Django, and popular ML libraries.",
    seoTitleRu: "Разработка на Python (FastAPI, Django) | Rovno.dev",
    seoDescRu: "Создание высоконагруженных бэкенд-сервисов на Python. FastAPI, Django, интеграции с LLM, парсинг данных и автоматизация.",
    seoTitleEn: "Python Development (FastAPI, Django) | Rovno.dev",
    seoDescEn: "Creation of high-load backend services in Python. FastAPI, Django, LLM integrations, data parsing, and automation.",
    featuresRu: [
      "Высоконагруженные API на FastAPI",
      "Интеграция с OpenAI, LangChain, LLM",
      "Сложные парсеры и ETL-процессы",
      "Микросервисная архитектура",
    ],
    featuresEn: [
      "High-load APIs on FastAPI",
      "Integration with OpenAI, LangChain, LLMs",
      "Complex parsers and ETL processes",
      "Microservice architecture",
    ],
  },
  {
    slug: "nextjs",
    titleRu: "Разработка на Next.js",
    titleEn: "Next.js Development",
    descRu: "Создание молниеносных и SEO-оптимизированных сайтов и веб-приложений с использованием React Server Components.",
    descEn: "Creating lightning-fast and SEO-optimized websites and web apps using React Server Components.",
    seoTitleRu: "Разработка сайтов на Next.js (React) | Rovno.dev",
    seoDescRu: "Заказать разработку сайта на Next.js. Идеальный SEO, высокий PageSpeed, поддержка SSR и SSG. От лендингов до сложных B2B-порталов.",
    seoTitleEn: "Next.js (React) Website Development | Rovno.dev",
    seoDescEn: "Order Next.js website development. Perfect SEO, high PageSpeed, SSR and SSG support. From landing pages to complex B2B portals.",
    featuresRu: [
      "App Router и React Server Components",
      "Идеальные показатели Core Web Vitals",
      "Headless CMS (Sanity, Strapi, Contentful)",
      "Сложные анимации и интерактивные интерфейсы",
    ],
    featuresEn: [
      "App Router and React Server Components",
      "Perfect Core Web Vitals scores",
      "Headless CMS (Sanity, Strapi, Contentful)",
      "Complex animations and interactive interfaces",
    ],
  },
];

export function findTech(slug: string): TechMeta | null {
  return TECH_STACK.find((t) => t.slug === slug) || null;
}
