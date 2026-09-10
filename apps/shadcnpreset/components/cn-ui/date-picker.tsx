"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/cn-ui/button"
import { Calendar } from "@/components/cn-ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/cn-ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  date?: Date
  defaultDate?: Date
  onDateChange?: (date?: Date) => void
  placeholder?: string
  className?: string
}

function DatePicker({
  date: dateProp,
  defaultDate,
  onDateChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledDate, setUncontrolledDate] = React.useState<
    Date | undefined
  >(defaultDate)
  const date = dateProp ?? uncontrolledDate

  function selectDate(next?: Date) {
    if (dateProp === undefined) {
      setUncontrolledDate(next)
    }
    onDateChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("w-[280px] justify-start text-left font-normal", className)}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        {date ? format(date, "PPP") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={selectDate} />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
