import type { Language } from './translations';

export const headerTranslations: Record<Language, Record<string, string>> = {
  en: {
    'nav.about': "About",
    'nav.admin': "Admin Panel",
    'nav.blog': "Rovnya Journal",
    'nav.language': "Language",
    'nav.login': "Login",
    'nav.logout': "Logout",
    'nav.order': "Make an Order",
    'nav.profile': "Profile",
    'nav.projects': "Projects",
  },
  ru: {
    'nav.about': "О нас",
    'nav.admin': "Админ-панель",
    'nav.blog': "Журнал «Ровня»",
    'nav.language': "Язык",
    'nav.login': "Войти",
    'nav.logout': "Выйти",
    'nav.order': "Оформить заказ",
    'nav.profile': "Профиль",
    'nav.projects': "Проекты",
  },
};
