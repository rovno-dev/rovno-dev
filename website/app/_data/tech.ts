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
  {
    slug: "react",
    titleRu: "Разработка на React",
    titleEn: "React Development",
    descRu: "Создание интерактивных интерфейсов и SPA на React с использованием современных хуков и паттернов.",
    descEn: "Building interactive UIs and SPAs with React using modern hooks and patterns.",
    seoTitleRu: "Разработка на React | Rovno.dev",
    seoDescRu: "Разработка интерфейсов на React: компонентный подход, хуки, оптимизация производительности.",
    seoTitleEn: "React Development | Rovno.dev",
    seoDescEn: "React UI development: component approach, hooks, performance optimization.",
    featuresRu: [
      "Функциональные компоненты и хуки",
      "React Server Components",
      "Оптимизация рендеринга",
      "Интеграция с TypeScript",
    ],
    featuresEn: [
      "Functional components and hooks",
      "React Server Components",
      "Rendering optimization",
      "TypeScript integration",
    ],
  },
  {
    slug: "typescript",
    titleRu: "Разработка на TypeScript",
    titleEn: "TypeScript Development",
    descRu: "Строгая типизация, типобезопасный код и снижение количества ошибок на этапе компиляции.",
    descEn: "Strict typing, type-safe code, and fewer runtime errors caught at compile time.",
    seoTitleRu: "Разработка на TypeScript | Rovno.dev",
    seoDescRu: "Разработка на TypeScript: строгая типизация, типобезопасность, интеграция с React и Node.js.",
    seoTitleEn: "TypeScript Development | Rovno.dev",
    seoDescEn: "TypeScript development: strict typing, type safety, React and Node.js integration.",
    featuresRu: [
      "Строгая типизация всего кода",
      "Типобезопасные API и компоненты",
      "Снижение количества runtime-ошибок",
      "Улучшение DX и рефакторинга",
    ],
    featuresEn: [
      "Strict typing across the codebase",
      "Type-safe APIs and components",
      "Fewer runtime errors",
      "Better DX and refactoring",
    ],
  },
  {
    slug: "postgresql",
    titleRu: "Разработка на PostgreSQL",
    titleEn: "PostgreSQL Development",
    descRu: "Проектирование и оптимизация баз данных PostgreSQL: индексы, запросы, миграции и масштабирование.",
    descEn: "Designing and optimizing PostgreSQL databases: indexes, queries, migrations, and scaling.",
    seoTitleRu: "Разработка и оптимизация PostgreSQL | Rovno.dev",
    seoDescRu: "Проектирование баз данных PostgreSQL, оптимизация запросов, индексы, миграции, масштабирование.",
    seoTitleEn: "PostgreSQL Development & Optimization | Rovno.dev",
    seoDescEn: "PostgreSQL database design, query optimization, indexes, migrations, scaling.",
    featuresRu: [
      "Проектирование схемы данных",
      "Оптимизация запросов и индексов",
      "Миграции без downtime",
      "Репликация и масштабирование",
    ],
    featuresEn: [
      "Database schema design",
      "Query and index optimization",
      "Zero-downtime migrations",
      "Replication and scaling",
    ],
  },
  {
    slug: "docker",
    titleRu: "Docker и DevOps",
    titleEn: "Docker & DevOps",
    descRu: "Контейнеризация, CI/CD, автоматизация деплоя и настройка инфраструктуры для стабильной работы.",
    descEn: "Containerization, CI/CD, deployment automation, and infrastructure setup for stable operations.",
    seoTitleRu: "Docker и DevOps для бизнеса | Rovno.dev",
    seoDescRu: "Контейнеризация приложений, настройка CI/CD, автоматизация деплоя и инфраструктуры.",
    seoTitleEn: "Docker & DevOps for Business | Rovno.dev",
    seoDescEn: "Application containerization, CI/CD setup, deployment and infrastructure automation.",
    featuresRu: [
      "Контейнеризация приложений",
      "Настройка CI/CD пайплайнов",
      "Автоматизация деплоя",
      "Мониторинг и логирование",
    ],
    featuresEn: [
      "Application containerization",
      "CI/CD pipeline setup",
      "Deployment automation",
      "Monitoring and logging",
    ],
  },
  {
    slug: "figma",
    titleRu: "Дизайн в Figma",
    titleEn: "Figma Design",
    descRu: "UI/UX-дизайн, прототипирование и дизайн-системы в Figma с передачей в разработку.",
    descEn: "UI/UX design, prototyping, and design systems in Figma with clean handoff to development.",
    seoTitleRu: "Дизайн в Figma: UI/UX и прототипы | Rovno.dev",
    seoDescRu: "UI/UX-дизайн в Figma: прототипирование, дизайн-системы, компоненты, передача в разработку.",
    seoTitleEn: "Figma Design: UI/UX and Prototypes | Rovno.dev",
    seoDescEn: "Figma UI/UX design: prototyping, design systems, components, developer handoff.",
    featuresRu: [
      "Прототипирование интерфейсов",
      "Дизайн-системы и компоненты",
      "Адаптивный дизайн",
      "Передача в разработку без потерь",
    ],
    featuresEn: [
      "Interface prototyping",
      "Design systems and components",
      "Responsive design",
      "Clean developer handoff",
    ],
  },
];

export function findTech(slug: string): TechMeta | null {
  return TECH_STACK.find((t) => t.slug === slug) || null;
}
