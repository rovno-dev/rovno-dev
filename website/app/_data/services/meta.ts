export interface ServiceMeta {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  iconKey: "palette" | "code" | "cube" | "film" | "megaphone" | "sparkle";
  accent: string;
  leadTime: string;
  startingAt: string;
}

export const SERVICES_META: ServiceMeta[] = [
  {
    slug: "audit",
    title: "Аудит / Audit",
    shortTitle: "Аудит",
    tagline: "Глубокая проверка инфраструктуры и кода",
    description: "Детально проверим инфраструктуру, найдём слабые места и подскажем как действовать дальше. Подготовим план и ТЗ под подходящую технологию.",
    iconKey: "code",
    accent: "#336DFF",
    leadTime: "1–2 недели",
    startingAt: "от 50 000 ₽",
  },
  {
    slug: "digitalization",
    title: "Цифровизация / Digitalization",
    shortTitle: "Цифровизация",
    tagline: "Автоматизация процессов и внедрение CRM",
    description: "Автоматизируем процессы, разработаем цифровые продукты под задачи и будем следить за стабильностью инфраструктуры.",
    iconKey: "cube",
    accent: "#A855F7",
    leadTime: "4–12 недель",
    startingAt: "от 150 000 ₽",
  },
  {
    slug: "startup",
    title: "Стартап / Startup",
    shortTitle: "Стартап",
    tagline: "MVP и запуск продукта",
    description: "Реализуем цифровой продукт, поможем выйграть инвестиционные раунды или просто протестируем идею для вашего стартапа.",
    iconKey: "sparkle",
    accent: "#10B981",
    leadTime: "6–10 недель",
    startingAt: "от 250 000 ₽",
  }
];

export function findServiceMeta(slug: string): ServiceMeta | null {
  return SERVICES_META.find((s) => s.slug === slug) ?? null;
}
