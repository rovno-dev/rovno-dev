export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
}

export const EVENTS: Record<string, Event[]> = {
  niyazgim: [
    {
      id: "e1",
      title: "Выступление на конференции TechLead 2025",
      description: "Рассказал о создании Unideka UI и опыте разработки дизайн-систем с открытым исходным кодом.",
      date: "2025-05-15",
      tags: ["conference", "speaking"],
    },
    {
      id: "e2",
      title: "Хакатон «Цифровой прорыв»",
      description: "Команда Rovno.dev заняла 2-е место с проектом AI-ассистента для аналитики данных.",
      date: "2025-04-20",
      tags: ["hackathon", "ai"],
    },
    {
      id: "e3",
      title: "Воркшоп по Next.js в Казанском IT-парке",
      description: "Провёл двухдневный интенсив по современной веб-разработке для 30 участников.",
      date: "2025-03-10",
      tags: ["workshop", "education"],
    },
  ],
  RovnoMikhail: [
    {
      id: "e4",
      title: "Встреча с партнёрами в Сколково",
      description: "Обсудили стратегию развития цифровых продуктов для EdTech-сектора.",
      date: "2025-05-22",
      tags: ["meeting", "partnership"],
    },
    {
      id: "e5",
      title: "Участие в форуме «Финтех без границ»",
      description: "Представил кейс Vanguard и обсудил тренды в инвестиционных приложениях.",
      date: "2025-04-05",
      tags: ["forum", "fintech"],
    },
  ],
  RovnoDanil: [
    {
      id: "e6",
      title: "Премьера 3D-ролика для бренда Aurora",
      description: "Публичный показ анимационного ролика, созданного для запуска новой линейки продуктов.",
      date: "2025-06-01",
      tags: ["premiere", "3d"],
    },
    {
      id: "e7",
      title: "Мастер-класс по Cinema 4D",
      description: "Обучил основам моушн-дизайна и процедурной анимации 25 студентов.",
      date: "2025-04-18",
      tags: ["masterclass", "motion"],
    },
  ],
};
