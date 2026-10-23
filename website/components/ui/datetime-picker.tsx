"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateTimePicker({
  date,
  setDate,
  className,
}: {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}) {
  const [time, setTime] = React.useState(date ? format(date, "HH:mm") : "12:00")

  // Sync time state if date changes externally
  React.useEffect(() => {
    if (date) setTime(format(date, "HH:mm"))
  }, [date])

  const handleSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined)
      return
    }
    const [hours, minutes] = time.split(":").map(Number)
    newDate.setHours(hours, minutes, 0, 0)
    setDate(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      setDate(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outlined"}
          className={cn(
            "w-full justify-start text-left font-normal bg-(--bg) hover:bg-(--state-hover)",
            !date && "text-muted-foreground",
            className
          )}
        >
          {/* Added text-foreground to fix the contrast issue */}
          <CalendarIcon className="mr-2 size-4 text-foreground" />
          {date ? format(date, "PPP HH:mm") : <span>Выберите дату</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="p-3 border-b border-(--outline)"
        />
        <div className="p-3 flex items-center gap-2 bg-(--bg)">
          <span className="text-sm font-medium">Время:</span>
          <Input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-[120px] h-8 bg-(--card)"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
