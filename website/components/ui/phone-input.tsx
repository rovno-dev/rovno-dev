"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Local phone input. No third-party library, no external CSS, no flag
 * SVGs fetched from a CDN. Displays RU numbers as `+7 (XXX) XXX-XX-XX`
 * while typing and emits E.164 (`+7XXXXXXXXXX`) to the parent.
 *
 * The backend validator (`app/api/v1/orders.py`, `phonenumbers` lib)
 * accepts any of the ALLOWED_REGIONS formats — we just need to send
 * clean E.164. Non-RU international inputs are passed through as
 * `+<digits>`, which the same backend validator handles.
 */

const RU_PREFIX = "+7";
const RU_DIGITS = 10;

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Turn `9375803414` into `+7 (937) 580-34-14`. */
function formatRu(d: string): string {
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 8);
  const p4 = d.slice(8, 10);
  let out = RU_PREFIX;
  if (p1) out += ` (${p1}`;
  if (p1.length === 3) out += ")";
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  error?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  value,
  onChange,
  className,
  error,
  placeholder = "+7 (___) ___-__-__",
  name,
  disabled,
}: PhoneInputProps) {
  const [display, setDisplay] = React.useState("");

  // Keep display in sync when the parent resets the value to "".
  React.useEffect(() => {
    if (!value) {
      setDisplay("");
      return;
    }
    const d = digitsOnly(value);
    if (value.startsWith("+7") && d.length === 11) {
      setDisplay(formatRu(d.slice(1)));
    } else {
      setDisplay(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const d = digitsOnly(raw);

    if (!d) {
      setDisplay("");
      onChange(undefined);
      return;
    }

    // ── RU path ────────────────────────────────────────────────────
    // Triggered by: leading `+7`, leading `8`, bare 10 digits.
    let ruDigits = "";
    let isRu = false;
    if (raw.startsWith("+7")) {
      ruDigits = d.replace(/^7/, "").slice(0, RU_DIGITS);
      isRu = true;
    } else if (d.startsWith("8") && d.length <= 11) {
      ruDigits = d.slice(1, 11);
      isRu = true;
    } else if (d.startsWith("7") && d.length <= 11) {
      ruDigits = d.slice(1, 11);
      isRu = true;
    } else if (d.length <= RU_DIGITS && !raw.startsWith("+")) {
      ruDigits = d.slice(0, RU_DIGITS);
      isRu = true;
    }

    if (isRu) {
      setDisplay(formatRu(ruDigits));
      // Emit E.164 only when the number is complete; otherwise undefined
      // so the parent's validation shows "please enter your number".
      onChange(ruDigits.length === RU_DIGITS ? `+7${ruDigits}` : undefined);
      return;
    }

    // ── Non-RU international ───────────────────────────────────────
    // User pasted a full international number. Keep digits as-is; the
    // backend validator decides whether it's in an allowed region.
    setDisplay(raw);
    onChange(raw.startsWith("+") ? `+${d}` : undefined);
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="tel"
        name={name}
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm",
          "hover:border-(--primary-card)",
          error && "border-destructive focus-visible:ring-destructive/30",
        )}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
