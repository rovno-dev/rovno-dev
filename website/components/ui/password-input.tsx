"use client";

import * as React from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

/**
 * Drop-in replacement for `<Input type="password" />`. Adds a small eye
 * toggle at the right edge that flips between masked and plain text.
 * Everything else — sizing, focus ring, invalid state, disabled styling,
 * hover border — mirrors the base `<Input>` so the two look identical
 * side by side.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(
          "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent pl-2.5 pr-10 py-1 text-base transition-colors outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          "hover:border-(--primary-card)",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        // tabIndex={-1} keeps the toggle out of the tab order — it is a
        // convenience for the sighted user, not a form control. Keyboard
        // users can flip it with the same shortcut every OS uses (not
        // implemented here, the field is short enough to type blind).
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2",
          "inline-flex items-center justify-center size-7 rounded-md",
          "text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
          "transition-colors",
        )}
      >
        {visible ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
