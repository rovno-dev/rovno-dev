import type { Language } from './translations';

export const eventsTranslations: Record<Language, Record<string, string>> = {
  en: {
    'events.title': 'Events',
    'events.upcoming': 'Upcoming',
    'events.past': 'Past',
    'events.past_badge': 'Past',
    'events.featured_badge': 'Featured',
    'events.date_tbd': 'Date TBD',
    'events.empty_title': 'No events yet',
    'events.empty_body':
      "Events will appear here as soon as they're published.",
    'events.back_home': 'Back home',
    'events.search_placeholder': 'Search events...',
    'events.filters': 'Filters',
    'events.filter_when': 'When',
    'events.filter_all': 'All',
    'events.filter_city': 'City',
    'events.filter_featured': 'Highlights',
    'events.filter_featured_only': 'Featured only',
    'events.not_found': 'Nothing found',
    'events.reset_filters': 'Reset filters',
    // Route buttons under the venue address on event landing pages.
    'events.route_hint': 'Build a route',
    'events.route_yandex': 'Yandex Maps',
    'events.route_google': 'Google Maps',
  },
  ru: {
    'events.title': 'События',
    'events.upcoming': 'Скоро',
    'events.past': 'Прошли',
    'events.past_badge': 'Прошло',
    'events.featured_badge': 'Featured',
    'events.date_tbd': 'Дата уточняется',
    'events.empty_title': 'Пока нет событий',
    'events.empty_body':
      'События появятся здесь, как только будут опубликованы.',
    'events.back_home': 'На главную',
    'events.search_placeholder': 'Поиск по событиям...',
    'events.filters': 'Фильтры',
    'events.filter_when': 'Когда',
    'events.filter_all': 'Все',
    'events.filter_city': 'Город',
    'events.filter_featured': 'Особенности',
    'events.filter_featured_only': 'Только избранные',
    'events.not_found': 'Ничего не найдено',
    'events.reset_filters': 'Сбросить фильтры',
    // Route buttons under the venue address on event landing pages.
    'events.route_hint': 'Построить маршрут',
    'events.route_yandex': 'Яндекс.Карты',
    'events.route_google': 'Google Maps',
  },
};
