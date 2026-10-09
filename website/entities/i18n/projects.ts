import type { Language } from './translations';

export const projectsTranslations: Record<Language, Record<string, string>> = {
  en: {
    'projects.all': 'All',
    'projects.subtitle': 'High-performance digital solutions.',
    'projects.cover.fallback': 'Cover unavailable',
    'projects.cover.fallback_hint': 'No image',
    'projects.title': 'Projects',
    'projects.empty_home': 'No featured projects yet',
    'projects.empty_home_hint': 'Published projects will appear here automatically.',
  },
  ru: {
    'projects.all': 'Все',
    'projects.subtitle': 'Высокопроизводительные цифровые решения.',
    'projects.cover.fallback': 'Обложка недоступна',
    'projects.cover.fallback_hint': 'Нет изображения',
    'projects.title': 'Проекты',
    'projects.empty_home': 'Пока нет избранных проектов',
    'projects.empty_home_hint': 'Опубликованные проекты появятся здесь автоматически.',
  },
};
