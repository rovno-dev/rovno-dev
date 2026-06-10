export interface Award {
  id: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
}

export const AWARDS: Record<string, Award[]> = {
  niyazgim: [
    {
      id: "a1",
      title: "Победитель хакатона «Цифровой прорыв» 2024",
      description: "Первое место в треке «Искусственный интеллект» с проектом AI-ассистента для аналитики данных.",
      date: "2024-11-15",
      tags: ["hackathon", "ai"],
    },
    {
      id: "a2",
      title: "Лучший доклад на конференции TechLead 2024",
      description: "Награда за выступление «Создание дизайн-систем с открытым исходным кодом».",
      date: "2024-09-20",
      tags: ["conference", "speaking"],
    },
    {
      id: "a3",
      title: "Сертификат AWS Solutions Architect",
      description: "Подтверждённая экспертиза в проектировании распределённых систем на AWS.",
      date: "2024-06-10",
      tags: ["certification", "cloud"],
    },
  ],
  RovnoMikhail: [
    {
      id: "a4",
      title: "Премия «Лучший продуктовый дизайн года»",
      description: "Награда от сообщества дизайнеров за проект Vanguard.",
      date: "2024-12-01",
      tags: ["design", "award"],
    },
    {
      id: "a5",
      title: "Сертификат UX-исследователя",
      description: "Прошёл курс по юзабилити-тестированию и глубинным интервью.",
      date: "2024-08-15",
      tags: ["certification", "ux"],
    },
  ],
  RovnoDanil: [
    {
      id: "a6",
      title: "Золото на фестивале моушн-дизайна",
      description: "Работа «Aurora Flux» получила золотую награду в категории «Brand Motion».",
      date: "2025-02-10",
      tags: ["motion", "award"],
    },
    {
      id: "a7",
      title: "Сертификат специалиста по Cinema 4D",
      description: "Продвинутый уровень владения процедурной анимацией и симуляциями.",
      date: "2024-10-05",
      tags: ["certification", "3d"],
    },
  ],
};
