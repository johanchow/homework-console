import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/component/popover'
import { Button } from '@/component/button'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface CalendarProps {
  selected?: string
  onSelect?: (date: string | undefined) => void
  placeholder?: string
  className?: string
}

export default function Calendar({
  selected,
  onSelect,
  placeholder = '选择日期',
  className,
}: CalendarProps) {
  const [open, setOpen] = React.useState(false)
  // 将字符串转为 Date
  const selectedDate = selected ? new Date(selected) : undefined

  // 选择日期
  const handleSelect = (date?: Date) => {
    if (date) {
      // 格式化为 YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onSelect?.(`${year}-${month}-${day}`)
    } else {
      onSelect?.(undefined)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? selected : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          showOutsideDays
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
