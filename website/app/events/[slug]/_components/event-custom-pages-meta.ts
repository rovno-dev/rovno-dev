/**
 * Admin-facing metadata for the bespoke event templates. Separate from
 * event-custom-pages.tsx so the admin editor can list templates without
 * pulling both page bundles into its chunk.
 */
export interface EventCustomPageMeta {
  key: string;
  label: string;
  description: string;
}

export const EVENT_CUSTOM_PAGES_META: EventCustomPageMeta[] = [
  {
    key: "nash-dev",
    label: "Наш.Dev — Terminal Brutalism",
    description:
      "Landing для IT-мероприятия: интерактивный терминал, marquee, слайдер Нияза, регистрация с валидацией. Строго чёрный / белый / лайм #CCFF00, без скруглений.",
  },
];

export function findEventCustomPageMeta(
  key: string | null | undefined,
): EventCustomPageMeta | null {
  if (!key) return null;
  return EVENT_CUSTOM_PAGES_META.find((m) => m.key === key) ?? null;
}
