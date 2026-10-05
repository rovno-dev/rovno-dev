"use client";

import * as React from "react";
import {
  CaretDown,
  Check,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FloatingDropdown } from "@/components/ui/floating-dropdown";

// ─────────────────────────────────────────────────────────────────────
// Country catalogue
// ─────────────────────────────────────────────────────────────────────
//
// Each entry defines the national number layout via `groups` — the
// number is split into those chunk sizes, the first chunk wrapped in
// parentheses, the rest joined by `-` (or ` ` for countries that use
// spaces). Example: RU `[3,3,2,2]` → `(937) 580-34-14`.
//
// `dial` is the international prefix in `+N…` form. Two countries can
// share a dial code (RU / KZ both use +7, US / CA both use +1) — the
// country identity is decided by the picker, not by parsing.
//
// Ordering matters only for the initial parse of an external E.164
// value: the list is sorted by dial length descending before matching,
// so `+375…` is checked before `+7…`.

interface Country {
  code: string;
  flag: string;
  name: string;
  dial: string;
  groups: number[];
  /** Separator between groups after the first. Default `-`. */
  separator?: string;
}

const COUNTRIES: Country[] = [
  // CIS + nearby
  { code: "RU", flag: "🇷🇺", name: "Россия",        dial: "+7",   groups: [3, 3, 2, 2] },
  { code: "BY", flag: "🇧🇾", name: "Беларусь",      dial: "+375", groups: [2, 3, 2, 2] },
  { code: "KZ", flag: "🇰🇿", name: "Казахстан",     dial: "+7",   groups: [3, 3, 2, 2] },
  { code: "UA", flag: "🇺🇦", name: "Украина",       dial: "+380", groups: [2, 3, 2, 2] },
  { code: "UZ", flag: "🇺🇿", name: "Узбекистан",    dial: "+998", groups: [2, 3, 2, 2] },
  { code: "TJ", flag: "🇹🇯", name: "Таджикистан",   dial: "+992", groups: [2, 3, 2, 2] },
  { code: "TM", flag: "🇹🇲", name: "Туркменистан",  dial: "+993", groups: [2, 3, 2, 2] },
  { code: "KG", flag: "🇰🇬", name: "Кыргызстан",    dial: "+996", groups: [3, 3, 3] },
  { code: "AZ", flag: "🇦🇿", name: "Азербайджан",   dial: "+994", groups: [2, 3, 2, 2] },
  { code: "AM", flag: "🇦🇲", name: "Армения",       dial: "+374", groups: [2, 3, 3] },
  { code: "GE", flag: "🇬🇪", name: "Грузия",        dial: "+995", groups: [3, 3, 3] },
  { code: "MN", flag: "🇲🇳", name: "Монголия",      dial: "+976", groups: [2, 2, 4] },

  // Asia
  { code: "CN", flag: "🇨🇳", name: "Китай",         dial: "+86",  groups: [3, 4, 4] },
  { code: "JP", flag: "🇯🇵", name: "Япония",        dial: "+81",  groups: [2, 4, 4] },
  { code: "KR", flag: "🇰🇷", name: "Южная Корея",   dial: "+82",  groups: [2, 4, 4] },
  { code: "IN", flag: "🇮🇳", name: "Индия",         dial: "+91",  groups: [5, 5] },
  { code: "PK", flag: "🇵🇰", name: "Пакистан",      dial: "+92",  groups: [3, 3, 4] },
  { code: "TR", flag: "🇹🇷", name: "Турция",        dial: "+90",  groups: [3, 3, 2, 2] },
  { code: "IL", flag: "🇮🇱", name: "Израиль",       dial: "+972", groups: [2, 3, 4] },
  { code: "AE", flag: "🇦🇪", name: "ОАЭ",           dial: "+971", groups: [2, 3, 4] },
  { code: "SA", flag: "🇸🇦", name: "Саудовская Аравия", dial: "+966", groups: [2, 3, 4] },
  { code: "QA", flag: "🇶🇦", name: "Катар",         dial: "+974", groups: [4, 4] },
  { code: "KW", flag: "🇰🇼", name: "Кувейт",        dial: "+965", groups: [4, 4] },

  // Europe
  { code: "RS", flag: "🇷🇸", name: "Сербия",        dial: "+381", groups: [2, 3, 4] },
  { code: "ME", flag: "🇲🇪", name: "Черногория",    dial: "+382", groups: [2, 3, 3] },
  { code: "BA", flag: "🇧🇦", name: "Босния и Герцеговина", dial: "+387", groups: [2, 3, 3] },
  { code: "HR", flag: "🇭🇷", name: "Хорватия",      dial: "+385", groups: [2, 3, 4] },
  { code: "SI", flag: "🇸🇮", name: "Словения",      dial: "+386", groups: [2, 3, 3] },
  { code: "MK", flag: "🇲🇰", name: "Македония",     dial: "+389", groups: [2, 3, 3] },
  { code: "AL", flag: "🇦🇱", name: "Албания",       dial: "+355", groups: [2, 3, 4] },
  { code: "DE", flag: "🇩🇪", name: "Германия",      dial: "+49",  groups: [3, 4, 4] },
  { code: "FR", flag: "🇫🇷", name: "Франция",       dial: "+33",  groups: [1, 2, 2, 2, 2] },
  { code: "GB", flag: "🇬🇧", name: "Великобритания", dial: "+44",  groups: [4, 3, 3] },
  { code: "IT", flag: "🇮🇹", name: "Италия",        dial: "+39",  groups: [3, 3, 4] },
  { code: "ES", flag: "🇪🇸", name: "Испания",       dial: "+34",  groups: [3, 3, 3] },
  { code: "PT", flag: "🇵🇹", name: "Португалия",    dial: "+351", groups: [3, 3, 3] },
  { code: "NL", flag: "🇳🇱", name: "Нидерланды",    dial: "+31",  groups: [2, 3, 4] },
  { code: "BE", flag: "🇧🇪", name: "Бельгия",       dial: "+32",  groups: [3, 2, 2, 2] },
  { code: "CH", flag: "🇨🇭", name: "Швейцария",     dial: "+41",  groups: [2, 3, 2, 2] },
  { code: "AT", flag: "🇦🇹", name: "Австрия",       dial: "+43",  groups: [3, 3, 4] },
  { code: "PL", flag: "🇵🇱", name: "Польша",        dial: "+48",  groups: [3, 3, 3] },
  { code: "CZ", flag: "🇨🇿", name: "Чехия",         dial: "+420", groups: [3, 3, 3] },
  { code: "SK", flag: "🇸🇰", name: "Словакия",      dial: "+421", groups: [3, 3, 3] },
  { code: "HU", flag: "🇭🇺", name: "Венгрия",       dial: "+36",  groups: [2, 3, 4] },
  { code: "RO", flag: "🇷🇴", name: "Румыния",       dial: "+40",  groups: [3, 3, 3] },
  { code: "BG", flag: "🇧🇬", name: "Болгария",      dial: "+359", groups: [3, 3, 3] },
  { code: "GR", flag: "🇬🇷", name: "Греция",        dial: "+30",  groups: [3, 3, 4] },
  { code: "IE", flag: "🇮🇪", name: "Ирландия",      dial: "+353", groups: [2, 3, 4] },
  { code: "SE", flag: "🇸🇪", name: "Швеция",        dial: "+46",  groups: [2, 3, 4] },
  { code: "NO", flag: "🇳🇴", name: "Норвегия",      dial: "+47",  groups: [3, 2, 3] },
  { code: "DK", flag: "🇩🇰", name: "Дания",         dial: "+45",  groups: [2, 2, 2, 2] },
  { code: "FI", flag: "🇫🇮", name: "Финляндия",     dial: "+358", groups: [2, 3, 4] },
  { code: "IS", flag: "🇮🇸", name: "Исландия",      dial: "+354", groups: [3, 4] },
  { code: "EE", flag: "🇪🇪", name: "Эстония",       dial: "+372", groups: [3, 4] },
  { code: "LV", flag: "🇱🇻", name: "Латвия",        dial: "+371", groups: [2, 3, 3] },
  { code: "LT", flag: "🇱🇹", name: "Литва",         dial: "+370", groups: [3, 2, 3] },

  // Americas
  { code: "US", flag: "🇺🇸", name: "США",           dial: "+1",   groups: [3, 3, 4] },
  { code: "CA", flag: "🇨🇦", name: "Канада",        dial: "+1",   groups: [3, 3, 4] },
  { code: "MX", flag: "🇲🇽", name: "Мексика",       dial: "+52",  groups: [3, 3, 4] },
  { code: "BR", flag: "🇧🇷", name: "Бразилия",      dial: "+55",  groups: [2, 5, 4] },
  { code: "AR", flag: "🇦🇷", name: "Аргентина",     dial: "+54",  groups: [2, 4, 4] },
  { code: "CL", flag: "🇨🇱", name: "Чили",          dial: "+56",  groups: [1, 4, 4] },
  { code: "CO", flag: "🇨🇴", name: "Колумбия",      dial: "+57",  groups: [3, 3, 4] },
  { code: "PE", flag: "🇵🇪", name: "Перу",          dial: "+51",  groups: [3, 3, 3] },

  // Other
  { code: "AU", flag: "🇦🇺", name: "Австралия",     dial: "+61",  groups: [3, 3, 3] },
  { code: "NZ", flag: "🇳🇿", name: "Новая Зеландия", dial: "+64", groups: [2, 3, 4] },
  { code: "ZA", flag: "🇿🇦", name: "ЮАР",           dial: "+27",  groups: [2, 3, 4] },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // RU

/** Country-specific placeholder showing the shape of a full number.
 *  Built from the same `groups` array the formatter uses, so the two
 *  can never drift — add a country, the placeholder is correct. */
function placeholderFor(c: Country): string {
  const sep = c.separator ?? "-";
  return c.groups
    .map((g) => "•".repeat(g))
    .map((chunk, i) => (i === 0 ? `(${chunk})` : chunk))
    .join(sep === " " ? " " : sep);
}

function maxDigits(c: Country): number {
  return c.groups.reduce((a, b) => a + b, 0);
}

/** Format the national digit string according to the country layout. */
function formatNational(digits: string, c: Country): string {
  const sep = c.separator ?? "-";
  const parts: string[] = [];
  let i = 0;
  for (const g of c.groups) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + g));
    i += g;
  }
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `(${parts[0]}) ${parts.slice(1).join(sep)}`;
}

/** Display inside the field: national number only. The dial is drawn on
 *  the country button, so repeating it here would duplicate it. */
function nationalDisplay(c: Country, digits: string): string {
  return formatNational(digits, c);
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export interface PhoneInputFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  className?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  value,
  onChange,
  className,
  error,
  name,
  disabled,
}: PhoneInputFieldProps) {
  const [country, setCountry] = React.useState<Country>(DEFAULT_COUNTRY);
  const [digits, setDigits] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Track the last value we emitted so we can tell an external reset
  // apart from a state update that originated here.
  //
  // Initialized to `undefined`, NOT to `value`. If it started equal to
  // value, the sync effect below would short-circuit on first mount
  // (value === ref) and never parse the incoming number into country +
  // digits — the field would render empty even though the parent passed
  // a valid phone. On mount, ref is undefined and value is the saved
  // number, so the effect runs and does its job.
  const lastEmitted = React.useRef<string | undefined>(undefined);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  // The dropdown is portaled out of the field so it is not clipped by
  // any ancestor with `overflow: hidden` (the base Card has it). Kept
  // in a ref so the outside-click handler can tell a click inside the
  // dropdown apart from a click anywhere else on the page.
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  // ── External value sync ────────────────────────────────────────────
  // Only runs when the parent hands us a value that differs from what
  // we last emitted. Sorted by dial length descending so longer prefixes
  // (`+375`) are matched before shorter ones (`+7`).
  React.useEffect(() => {
    if (value === lastEmitted.current) return;
    if (!value) {
      setDigits("");
      lastEmitted.current = undefined;
      return;
    }
    const cleaned = value.replace(/\D/g, "");
    const sorted = [...COUNTRIES].sort(
      (a, b) => b.dial.replace(/\D/g, "").length - a.dial.replace(/\D/g, "").length,
    );
    const match = sorted.find((c) =>
      cleaned.startsWith(c.dial.replace(/\D/g, "")),
    );
    if (match) {
      setCountry(match);
      const nat = cleaned
        .slice(match.dial.replace(/\D/g, "").length)
        .slice(0, maxDigits(match));
      setDigits(nat);
    }
  }, [value]);

  // ── Outside-click close for the country dropdown ───────────────────
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // ── Emit helper ────────────────────────────────────────────────────
  const emit = (c: Country, nat: string) => {
    const complete = nat.length === maxDigits(c);
    const next = complete ? `${c.dial}${nat}` : undefined;
    lastEmitted.current = next;
    onChange(next);
  };

  // ── Input change ───────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // The field holds only the national number now — dial is on the
    // button — so every digit the user types belongs to the national
    // part. Strip non-digits, cap at the country's total length, done.
    const nat = e.target.value.replace(/\D/g, "").slice(0, maxDigits(country));
    setDigits(nat);
    emit(country, nat);
  };

  // ── Backspace fix ──────────────────────────────────────────────────
  // Without this, hitting backspace while the cursor sits right after a
  // mask character (space, `(`, `)`, `-`) only removes that mask, the
  // formatter instantly re-inserts it, and the display appears frozen.
  // The fix: when the char behind the cursor is a mask char, delete the
  // preceding digit instead and jump the cursor to the end of the new
  // formatted value.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;
    const input = e.currentTarget;
    const cursor = input.selectionStart ?? 0;
    const selEnd = input.selectionEnd ?? 0;
    // A selection should delete like normal — do not intercept.
    if (cursor !== selEnd) return;
    // Nothing to delete when the field is already empty.
    if (cursor <= 0) {
      e.preventDefault();
      return;
    }
    const charBefore = input.value[cursor - 1];
    if (charBefore && /[\s()\-]/.test(charBefore)) {
      e.preventDefault();
      const next = digits.slice(0, -1);
      setDigits(next);
      emit(country, next);
      // After React re-renders, drop the cursor at the end of the value.
      queueMicrotask(() => {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      });
    }
  };

  // ── Country selection ──────────────────────────────────────────────
  const selectCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    setQuery("");
    const nat = digits.slice(0, maxDigits(c));
    setDigits(nat);
    emit(c, nat);
  };

  // ── Dropdown filtering ─────────────────────────────────────────────
  const filteredCountries = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [query]);

  const display = nationalDisplay(country, digits);

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={wrapRef}
        className={cn(
          "relative flex h-10 w-full items-stretch rounded-lg border border-input bg-transparent",
          "transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          "hover:border-(--primary-card)",
          disabled && "opacity-50 pointer-events-none",
          error && "border-destructive focus-within:ring-destructive/30",
        )}
      >
        {/* Country trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-label="Выбрать страну"
          aria-expanded={open}
          className={cn(
            "flex items-center gap-1.5 px-2.5 shrink-0 rounded-l-lg",
            "text-body-4 text-(--on-bg-high)",
            "hover:bg-(--state-hover) transition-colors",
          )}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="tabular-nums">{country.dial}</span>
          <CaretDown
            className={cn(
              "size-3 text-(--on-bg-low) transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {/* Divider */}
        <span className="w-px my-2 bg-(--outline)" />

        {/* National number */}
        <input
          type="tel"
          name={name}
          inputMode="tel"
          autoComplete="tel"
          disabled={disabled}
          value={display}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderFor(country)}
          className={cn(
            "flex-1 min-w-0 bg-transparent pl-2.5 pr-2.5 outline-none rounded-r-lg",
            "text-body-4 placeholder:text-muted-foreground",
          )}
        />

        {/* Country dropdown — portaled out of the field so a parent
            with overflow:hidden (the base Card) cannot clip it. */}
        <FloatingDropdown
          open={open}
          anchorRef={wrapRef}
          dropdownRef={(el) => (dropdownRef.current = el)}
          sideOffset={6}
          className="z-50 w-[320px] max-w-[calc(100vw-2rem)]"
        >
          <div className="rounded-xl border border-(--outline) bg-(--card) shadow-xl overflow-hidden">
            <div className="relative border-b border-(--outline)">
              <MagnifyingGlass className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найти страну…"
                className="w-full h-9 pl-8 pr-3 bg-transparent outline-none text-body-4 placeholder:text-(--on-bg-low)"
              />
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-admin py-1">
              {filteredCountries.length === 0 ? (
                <p className="px-3 py-4 text-center text-body-5 text-(--on-bg-low)">
                  Ничего не найдено
                </p>
              ) : (
                filteredCountries.map((c) => {
                  const selected = c.code === country.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => selectCountry(c)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 h-9 text-left text-body-4",
                        "hover:bg-(--state-hover) transition-colors",
                        selected && "bg-(--state-hover)",
                      )}
                    >
                      <span className="text-base leading-none shrink-0">
                        {c.flag}
                      </span>
                      <span className="flex-1 truncate text-(--on-bg-high)">
                        {c.name}
                      </span>
                      <span className="tabular-nums text-body-5 text-(--on-bg-low) shrink-0">
                        {c.dial}
                      </span>
                      {selected && (
                        <Check className="size-3.5 text-(--primary) shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </FloatingDropdown>
      </div>

      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
