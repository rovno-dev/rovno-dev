import { CLIENTS, Client } from "../clients";

export type ProjectTagType = {
  title: string;
  href?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  tags?: ProjectTagType[];
  cover: {
    videoSrc?: string,
    imageSrc: string,
  };
  href?: string;
  category?: string;
  clientId: string;
  platform?: string;
  period?: string;
  techStack?: string[];
  metrics?: { label: string; value: string; description: string }[];
  media?: { type: 'image' | 'video'; src: string }[];
}

export const PROJECTS: Record<string, Project> = {
  vanguard: {
    id: "1",
    slug: "vanguard",
    title: "Vanguard: интернет-магазин электроники",
    description: "Полное переосмысление всего дизайна для интернет-магазина электроники и посты к 8 марта",
    shortDescription: "Редизайн интернет-магазина электроники с ростом конверсии +45%.",
    cover: {
      videoSrc: 'https://kinescope.io/74B6UBPTKLNKGBTunQ5bH8',
      imageSrc: '/_static/projects/vanguard/vanguard-cover.png',
    },
    href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki",
    category: "E-commerce",
    clientId: "1",
    period: "2024",
    techStack: ["Figma", "Adobe Illustrator"],
    metrics: [
      { label: "Конверсия", value: "+45%", description: "рост регистраций" },
      { label: "Отток", value: "-20%", description: "снижение отказов" },
    ],
    media: [
      { type: 'image', src: '/_static/projects/vanguard/vanguard-1.png' },
      { type: 'image', src: '/_static/projects/vanguard/vanguard-2.png' },
      { type: 'image', src: '/_static/projects/vanguard/vanguard-3.png' },
      { type: 'image', src: '/_static/projects/vanguard/vanguard-4.png' },
    ],
  },
  alx: {
    id: "2",
    slug: "alx",
    title: "Чужой | ALX-9 - ИИ выставка",
    description: "Разработка фирменного стиля и веб-сайта для технологической компании ALX.",
    shortDescription: "Разработка айдентики и веб-сайта для технологической компании ALX.",
    cover: {
      videoSrc: 'https://kinescope.io/kbb8cwdAPa5tuNS7NDuDJm',
      imageSrc: '/_static/projects/alx/alx-cover.png',
    },
    href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
    category: "Айдентика",
    clientId: "2",
    platform: "Веб-сайт",
    period: "2024",
    techStack: ["Figma", "After Effects"],
    metrics: [
      { label: "Узнаваемость", value: "+60%", description: "Ребрендинг помог бренду сильно продвинуться в медиа благодаря качественной анимации от наших 3D-художников" },
    ],
    media: [
      { type: 'image', src: '/_static/projects/alx/alx-1.png' },
      { type: 'image', src: '/_static/projects/alx/alx-2.png' },
      { type: 'image', src: '/_static/projects/alx/alx-3.png' },
      { type: 'image', src: '/_static/projects/alx/alx-4.png' },
      { type: 'video', src: 'https://kinescope.io/wJ6WmWZCkVYZr6yEDvYmLo' },
    ],
  },
  sadovod: {
    id: "3",
    slug: "sadovod",
    title: "Sadovod - Интернет магазин",
    description: "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом и корзиной.",
    shortDescription: "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом.",
    cover: {
      videoSrc: '',
      imageSrc: '/_static/projects/sadovod/sadovod-cover.png',
    },
    href: "https://dprofile.ru/case/162985/sadovod-internet-magazin",
    category: "E-commerce",
    clientId: "3",
    period: "2024",
    techStack: ["Figma", "Adobe Illustrator"],
    metrics: [
      { label: "Конверсия", value: "+35%", description: "Увеличение конверсии после редизайна" },
    ],
    media: [
      { type: 'image', src: '/_static/projects/sadovod/sadovod-1.png' },
      { type: 'image', src: '/_static/projects/sadovod/sadovod-2.png' },
      { type: 'image', src: '/_static/projects/sadovod/sadovod-3.png' },
    ],
  },
  courtElegance: {
    id: "4",
    slug: "courtElegance",
    title: "The Court Elegance - Теннисный клуб",
    description: "Разработка сайта премиального теннисного клуба, расположенного в городе Остин, США, штат Техас.",
    shortDescription: "Сайт премиального теннисного клуба в Техасе, США.",
    cover: {
      videoSrc: '',
      imageSrc: '/_static/projects/courtElegance/courtElegance-cover.png',
    },
    href: "https://dprofile.ru/case/160100/the-court-elegance-tennisnyi-klub",
    category: "E-commerce",
    clientId: "4",
    period: "2025",
    techStack: ["Figma", "Wix"],
    media: [
      { type: 'image', src: '/_static/projects/courtElegance/courtElegance-cover.png' },
      { type: 'image', src: '/_static/projects/courtElegance/courtElegance-cover.png' },
      { type: 'image', src: '/_static/projects/courtElegance/courtElegance-cover.png' },
    ],
  },
  bread: {
    id: "5",
    slug: "bread",
    title: "Хлебная Страна - Промо-ролик",
    description: "Разработка айдентики для продуктов серии Хлебная Страна от БКК",
    shortDescription: "Айдентика и промо-ролик для продуктовой серии «Хлебная Страна».",
    cover: {
      videoSrc: 'https://kinescope.io/7Y5P3U8JHseTQB8n6CgLjq',
      imageSrc: '/_static/projects/bread/bread-cover.png',
    },
    href: "https://dprofile.ru/case/168046/xlebnaia-strana-promo-rolik",
    category: "Айдентика",
    clientId: "5",
    period: "2026",
    techStack: ["Figma", "Blender", "Adobe After Effects", "Adobe Premier Pro", "Crita"],
    media: [
      { type: 'video', src: 'https://kinescope.io/aeKrj7KerGCQnPo7rPo22t' },
      { type: 'image', src: '/_static/projects/bread/bread-1.png' },
      { type: 'image', src: '/_static/projects/bread/bread-2.png' },
      { type: 'image', src: '/_static/projects/bread/bread-3.png' },
      { type: 'image', src: '/_static/projects/bread/bread-4.png' },
    ],
  },
  concord: {
    id: "6",
    slug: "concord",
    title: "Concord Construction - Строительная компания",
    description: "Разработка дизайна сайта и айдентики для строительной компании",
    shortDescription: "Дизайн сайта и айдентика для строительной компании Concord Construction.",
    cover: {
      videoSrc: 'https://kinescope.io/3s92BgDF6MgamUYs3TtqJC',
      imageSrc: '/_static/projects/concord/concord-cover.png',
    },
    href: "https://dprofile.ru/case/185165/concord-construction-stroitelnaia-kompaniia",
    category: "Корпоративные сайты",
    clientId: "6",
    period: "2025",
    techStack: ["Figma", "Adobe Illustrator", "Blender"],
    metrics: [
      { label: "Расходы на СММ", value: "-35%", description: "Благодаря простому дизайну удалось повысить узнаваемость среди конкурентов и сократить создание постов до 5 часов в неделю" },
      { label: "Конверсия", value: "+15%", description: "Повышенная узнаваемость позволила увеличить количество заявок на работы" },
      { label: "Экономия на мерче", value: "75%", description: "Простой дизайн позволяет выпускать простые и очень яркие элементы фирменной экипировки что критично в больших масштабах строительной области" },
    ],
    media: [
      { type: 'image', src: '/_static/projects/concord/concord-1.png' },
      { type: 'image', src: '/_static/projects/concord/concord-2.png' },
      { type: 'image', src: '/_static/projects/concord/concord-3.png' },
      { type: 'video', src: 'https://kinescope.io/jpn627TNuBgbK3gJ7dsMqP' },
    ],
  },
  lostPlay: {
    id: "7",
    slug: "lost-play",
    title: "Lost Play",
    description: "Разработка дизайна сайта и айдентики для строительной компании",
    shortDescription: "Дизайн сайта и айдентика для строительной компании Concord Construction.",
    cover: {
      videoSrc: '',
      imageSrc: '/_static/projects/lostPlay/lostPlay-cover.png',
    },
    href: "https://dprofile.ru/case/185165/concord-construction-stroitelnaia-kompaniia",
    category: "Корпоративные сайты",
    clientId: "6",
    period: "2025",
    techStack: ["Figma", "Adobe Illustrator", "Blender"],
    metrics: [
      { label: "Расходы на СММ", value: "-35%", description: "Благодаря простому дизайну удалось повысить узнаваемость среди конкурентов и сократить создание постов до 5 часов в неделю" },
      { label: "Конверсия", value: "+15%", description: "Повышенная узнаваемость позволила увеличить количество заявок на работы" },
      { label: "Экономия на мерче", value: "75%", description: "Простой дизайн позволяет выпускать простые и очень яркие элементы фирменной экипировки что критично в больших масштабах строительной области" },
    ],
    media: [
      { type: 'image', src: '/_static/projects/lostPlay/lostPlay-1.png' },
      { type: 'image', src: '/_static/projects/lostPlay/lostPlay-2.png' },
      { type: 'image', src: '/_static/projects/lostPlay/lostPlay-3.png' },
    ],
  },
};
