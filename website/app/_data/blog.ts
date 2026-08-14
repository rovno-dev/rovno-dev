export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  href: string;
  date: string;
  tags: string[];
}

export const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "kak-my-delali-dizajn-dlya-finteh-startapa",
    title: "Как мы делали дизайн для финтех-стартапа",
    description: "Рассказываем о процессе создания интерфейса для инвестиционного приложения: от исследований до финальных пикселей.",
    image: "/images/projects/vanguard.png",
    href: "https://t.me/rovno_dev/1",
    date: "2025-03-15",
    tags: ["Дизайн", "Fintech"],
  },
  {
    id: "2",
    slug: "pochemu-my-vybrali-next-js-dlya-novogo-proekta",
    title: "Почему мы выбрали Next.js для нового проекта",
    description: "Сравнение фреймворков и причины, по которым Next.js стал нашим основным инструментом для веб-разработки.",
    image: "/images/projects/alx.png",
    href: "https://t.me/rovno_dev/2",
    date: "2025-02-20",
    tags: ["Разработка", "Next.js"],
  },
  {
    id: "3",
    slug: "motion-dizajn-kak-animaciya-uluchshaet-ux",
    title: "Motion-дизайн: как анимация улучшает UX",
    description: "Разбираем примеры из наших проектов и объясняем, почему микроанимации важны для пользовательского опыта.",
    image: "/images/projects/court.png",
    href: "https://t.me/rovno_dev/3",
    date: "2025-01-10",
    tags: ["Motion", "UX"],
  },
  {
    id: "4",
    slug: "kak-my-sozdavali-identiku-dlya-alx",
    title: "Как мы создавали айдентику для ALX",
    description: "Закулисье разработки фирменного стиля для технологической компании: от брифа до финального брендбука.",
    image: "/images/projects/alx.png",
    href: "https://t.me/rovno_dev/4",
    date: "2024-12-05",
    tags: ["Айдентика", "Брендинг"],
  },
  {
    id: "5",
    slug: "unideka-ui-nasha-dizajn-sistema-s-otkrytym-ishodnym-kodom",
    title: "Unideka UI: наша дизайн-система с открытым исходным кодом",
    description: "Почему мы решили поделиться своей библиотекой компонентов и как она помогает ускорять разработку.",
    image: "/images/projects/sadovod.png",
    href: "https://t.me/rovno_dev/5",
    date: "2024-11-18",
    tags: ["UI", "Open Source"],
  },
];
