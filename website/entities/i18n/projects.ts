import type { Language } from './translations';

export const projectsTranslations: Record<Language, Record<string, string>> = {
  en: {
    'projects.all': 'All',
    'projects.subtitle': 'High-performance digital solutions.',
    'projects.cover.fallback': 'Cover unavailable',
    'projects.cover.fallback_hint': 'No image',
    'projects.title': 'Projects',
  },
  ru: {
    'projects.all': 'Все',
    'projects.subtitle': 'Высокопроизводительные цифровые решения.',
    'projects.cover.fallback': 'Обложка недоступна',
    'projects.cover.fallback_hint': 'Нет изображения',
    'projects.title': 'Проекты',
  },
};
