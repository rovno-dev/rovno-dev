"use client"
import { useTheme } from "@/providers/theme-provider"
import { SystemThemeIcon, SunIcon, NightIcon } from "../icons"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: "system", icon: SystemThemeIcon, label: "Системная" },
    { value: "light", icon: SunIcon, label: "Светлая" },
    { value: "dark", icon: NightIcon, label: "Тёмная" },
  ] as const

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 w-fit h-9">
      {options.map((opt) => {
        const Icon = opt.icon
        const isActive = theme === opt.value
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
            <Icon 
              className={cn(
                "size-4! transition-colors",
                isActive 
                  ? "[&_path]:fill-(--bg)" 
                  : "[&_path]:fill-(--on-bg-low) group-hover:[&_path]:fill-(--on-bg-high)"
              )} 
            />
            <span className="sr-only">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
