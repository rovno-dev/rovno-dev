import type { Language } from './translations';

export const heroTranslations: Record<Language, Record<string, string>> = {
  en: {
    'hero.order': 'Book call',
    'hero.title.part1': 'The most',
    'hero.title.part2': 'sharp:',
    'hero.subtitle.part1': 'For those who care.',
    'hero.subtitle.part2': 'Developing services of the future, private and efficient AI, services that delight users every day.',
  },
  ru: {
    'hero.order': 'Оставить заявку',
    'hero.title.part1': 'Самые',
    'hero.title.part2': 'ровные:',
    'hero.subtitle.part1': 'Для тех, кому дороги.',
    'hero.subtitle.part2': 'Разработка сервисов будущего, приватного и эффективного ИИ, сервисов, радующих пользователей каждый день.',
  },
};
