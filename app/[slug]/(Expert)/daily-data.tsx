export interface DailyPost {
  id: string;
  text: string;
  date: string;
  tags?: string[];
}

export const DAILY_POSTS: Record<string, DailyPost[]> = {
  niyazgim: [
    {
      id: "d1",
      text: "Сегодня весь день писал код для нового компонента Unideka UI. Получилось красиво, но спать хочется 😴",
      date: "2025-04-01",
      tags: ["code", "ui"],
    },
    {
      id: "d2",
      text: "Кофе — топливо разработчика. Третья чашка за утро — норма?",
      date: "2025-03-28",
      tags: ["life", "coffee"],
    },
    {
      id: "d3",
      text: "Обновил документацию по проекту. Теперь хотя бы сам понимаю, что написал месяц назад.",
      date: "2025-03-20",
      tags: ["docs", "productivity"],
    },
  ],
  RovnoMikhail: [
    {
      id: "d4",
      text: "Встреча с клиентом прошла отлично! Обсудили новый проект в сфере EdTech. Скоро расскажу подробности.",
      date: "2025-04-02",
      tags: ["client", "edtech"],
    },
    {
      id: "d5",
      text: "Разбирал почту после выходных. 47 непрочитанных — новый рекорд?",
      date: "2025-03-30",
      tags: ["work", "email"],
    },
  ],
  RovnoDanil: [
    {
      id: "d6",
      text: "Рендерил новую 3D-сцену для промо-ролика. 12 часов — и результат того стоит!",
      date: "2025-04-03",
      tags: ["3d", "motion"],
    },
    {
      id: "d7",
      text: "Нашёл идеальный референс для анимации логотипа. Вдохновение — наше всё.",
      date: "2025-03-25",
      tags: ["animation", "inspiration"],
    },
  ],
};
