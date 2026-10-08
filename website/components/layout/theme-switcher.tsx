"use client"
import { useTheme } from "@/providers/theme-provider"
import { CircleHalfIcon, SunIcon, MoonIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const options = [
    { value: "system", icon: CircleHalfIcon, label: "Системная" },
    { value: "light", icon: SunIcon, label: "Светлая" },
    { value: "dark", icon: MoonIcon, label: "Тёмная" },
  ] as const

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 w-fit h-9">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = mounted && theme === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "group relative flex size-8 items-center justify-center rounded-full transition-all duration-200 outline-none cursor-pointer",
              isActive
                ? "bg-(--on-bg-high) shadow-sm"
                : "hover:bg-(--state-hover)"
            )}
          >
            {/*
              Phosphor icons render as <svg fill="currentColor"> with plain
              <path> children. Their colour is therefore driven by the CSS
              `color` property, not by `stroke-*` on the child paths — the
              old [&_path]:stroke-(--bg) set the stroke and left the fill
              inheriting the parent text colour, so the active glyph stayed
              dark against the inverted (dark) active pill.

              text-(--bg) sets `color` on the SVG itself, which currentColor
              picks up for both fill and any stroked sub-elements, so the
              glyph flips to the page background colour and stays readable.
            */}
            <Icon
              className={cn(
                "size-4! transition-colors",
                isActive
                  ? "text-(--bg)"
                  : "text-(--on-bg-low) group-hover:text-(--on-bg-high)"
              )}
            />
            <span className="sr-only">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
