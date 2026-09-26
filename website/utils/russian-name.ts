/**
 * Russian instrumental case (творительный падеж) for names, used after
 * "с" in phrases like "работать с <кем>".
 *
 * This is a heuristic, not a morphological engine. It covers the common
 * shapes of Russian given names and surnames — enough for a CTA — and
 * fails gracefully: unfamiliar words just get the consonant rule ("-ом"),
 * which produces a slightly-off form rather than a broken sentence.
 *
 * Only declines one word per call. To decline a full name, split on
 * whitespace and map each word.
 */
export function declineRussianWord(word: string): string {
  if (!word) return word;
  const lower = word.toLowerCase();
  const len = word.length;
  if (len < 2) return word;

  // Already inflected? Don't double-decline. Common Russian endings for
  // the instrumental case, in order of specificity.
  if (/(ым|им|ом|ем|ой|ей|ою|ею)$/.test(lower)) return word;

  // Surnames ending in -ов/-ев/-ин/-ын take "-ым".
  // Гимадиев → Гимадиевым, Иванов → Ивановым, Киткин → Киткиным.
  if (/(ов|ев|ёв|ин|ын)$/.test(lower)) return word + "ым";

  // Adjectival surnames ending in -ий take "-им".
  // Бессоновский → Бессоновским, Горский → Горским.
  if (lower.endsWith("ий")) return word.slice(0, -2) + "им";

  // Feminine names ending in -я take "-ей".
  // Мария → Марией, Юлия → Юлией.
  if (lower.endsWith("я")) return word.slice(0, -1) + "ей";

  // Feminine names ending in -а take "-ой".
  // Анна → Анной, Никита (m.) → Никитой (works either way).
  if (lower.endsWith("а")) return word.slice(0, -1) + "ой";

  // Masculine names ending in -й take "-ем".
  // Николай → Николаем, Андрей → Андреем.
  if (lower.endsWith("й")) return word.slice(0, -1) + "ем";

  // Masculine names ending in soft sign take "-ем".
  // Игорь → Игорем.
  if (lower.endsWith("ь")) return word.slice(0, -1) + "ем";

  // Masculine names ending in a consonant take "-ом".
  // Нияз → Ниязом, Михаил → Михаилом, Данил → Данилом.
  return word + "ом";
}

/**
 * Declines the FIRST word of `name` — that's what the CTA shows.
 * A name like "Нияз Гимадиев" produces "Ниязом", not "Ниязом Гимадиевым" —
 * the surname is intentionally dropped for brevity on the CTA.
 */
export function declineRussianFirstName(name: string): string {
  const first = (name || "").trim().split(/\s+/)[0] || "";
  return declineRussianWord(first);
}
