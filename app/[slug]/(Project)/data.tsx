export interface Metric {
  label: string;
  value: string;
  description: string;
}

export interface Project {
  id: number;
  title: string;
  image: string;
  category?: string;
  href?: string;
  description?: string;
  client?: string;
  platform?: string;
  period?: string;
  techStack?: string[];
  metrics?: Metric[];
}

export const PROJECTS: Record<string, Project> = {
  courtElegance: {
    id: 4,
    title: "The Court Elegance - Теннисный клуб",
    image: "/images/projects/court.png",
    category: "Проекты",
    href: "https://dprofile.ru/case/160100/the-court-elegance-tennisnyi-klub",
    description: "Полный редизайн аналитического ядра для корпоративных клиентов. Внедрение realtime обработки данных и сложной визуализации.",
    client: "The Court Elegance",
    platform: "Web App",
    period: "2024",
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    metrics: [
      { label: "КОНВЕРСИЯ", value: "+45%", description: "Рост регистраций" },
      { label: "ОТТОК", value: "-20%", description: "Снижение отказов" },
      { label: "ОЦЕНКА В APP STORE", value: "4.9", description: "Рейтинг" },
    ],
  },
  alx: {
    id: 3,
    title: "Чужой | ALX-9 - ИИ выставка",
    image: "/images/projects/alx.png",
    category: "Проекты",
    href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
    description: "Разработка масштабируемого мобильного приложения с интеграцией AR-примерочной и бесшовным чекаутом.",
    client: "ALX-9",
    platform: "Mobile App",
    period: "2023",
    techStack: ["React Native", "TypeScript", "GraphQL", "Figma"],
    metrics: [
      { label: "КОНВЕРСИЯ", value: "+60%", description: "Рост установок" },
      { label: "ОТТОК", value: "-15%", description: "Снижение отказов" },
      { label: "ОЦЕНКА В APP STORE", value: "4.8", description: "Рейтинг" },
    ],
  },
  sadovod: {
    id: 2,
    title: "Sadovod - Интернет магазин",
    image: "/images/projects/sadovod.png",
    category: "Проекты",
    href: "https://dprofile.ru/case/162985/sadovod-internet-magazin",
    description: "Миграция монолитной архитектуры на микросервисы. Повышение отказоустойчивости до 99.99%.",
    client: "Sadovod",
    platform: "Web App",
    period: "2023 - 2024",
    techStack: ["Next.js", "Node.js", "MongoDB", "Docker"],
    metrics: [
      { label: "СКОРОСТЬ", value: "x3", description: "Ускорение загрузки" },
      { label: "ДОСТУПНОСТЬ", value: "99.99%", description: "Uptime" },
      { label: "ОЦЕНКА", value: "4.7", description: "Рейтинг" },
    ],
  },
  vanguard: {
    id: 1,
    title: "Vanguard: интернет-магазин электроники",
    image: "/images/projects/vanguard.png",
    category: "Проекты",
    href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki",
    description: "Полное переосмысление цифровой экосистемы для ведущего инвестиционного фонда. Архитектура, ориентированная на прозрачность данных и экстремальную производительность.",
    client: "Vanguard FinTech",
    platform: "iOS & Android App",
    period: "2023 - 2024",
    techStack: ["React Native", "TypeScript", "GraphQL", "Node.js", "WebGL"],
    metrics: [
      { label: "КОНВЕРСИЯ", value: "+45%", description: "Рост регистраций" },
      { label: "ОТТОК", value: "-20%", description: "Снижение отказов" },
      { label: "ОЦЕНКА В APP STORE", value: "4.9", description: "Рейтинг" },
    ],
  },
};
