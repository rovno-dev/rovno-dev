/* LLM context: Fixing icon overlap in trigger and enhancing DropdownMenu item layout */

"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/providers/theme-provider"
import { SystemThemeIcon, SunIcon, NightIcon } from "../icons"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tonal-card" size="icon-small" className="relative">
          <SunIcon className="size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <NightIcon className="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Поменять тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="min-w-40">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2.5 cursor-pointer">
          <SunIcon className="size-4 opacity-70" />
          <span className="text-body-3">Светлая</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2.5 cursor-pointer">
          <NightIcon className="size-4 opacity-70" />
          <span className="text-body-3">Тёмная</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2.5 cursor-pointer">
          <SystemThemeIcon className="size-4 opacity-70" />
          <span className="text-body-3">Системная</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}