"use client"
import { cn } from "@/lib/utils"

interface EditableProps {
  value: string
  onChange: (val: string) => void
  isEditing: boolean
  className?: string
  multiline?: boolean
  placeholder?: string
}

export function Editable({ value, onChange, isEditing, className, multiline, placeholder }: EditableProps) {
  if (!isEditing) return <span className={className}>{value}</span>

  const baseClass = cn(
    "outline-none border-2 border-transparent hover:border-white/20 focus:border-blue-500 rounded px-1 -mx-1 transition-colors bg-transparent w-full",
    className
  )

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(baseClass, "resize-none field-sizing-content min-h-[1.5em] block overflow-hidden")}
        rows={1}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClass}
    />
  )
}
