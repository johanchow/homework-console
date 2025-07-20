import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/component/popover'
import { Button } from '@/component/button'
import { CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DayPicker } from 'react-day-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'
import 'react-day-picker/dist/style.css'

export type TimePrecision = 'date' | 'hour' | 'minute' | 'second'

interface CalendarProps {
  selected?: string
  onSelect?: (date: string | undefined) => void
  placeholder?: string
  className?: string
  precision?: TimePrecision
  disabled?: boolean
}

export default function Calendar({
  selected,
  onSelect,
  placeholder = '选择日期',
  className,
  precision = 'date',
  disabled = false,
}: CalendarProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTime, setSelectedTime] = React.useState({
    hour: '00',
    minute: '00',
    second: '00'
  })
  const [tempSelectedDate, setTempSelectedDate] = React.useState<Date | undefined>()

  // 使用 useMemo 来避免不必要的重新计算
  const selectedDate = React.useMemo(() => {
    return selected ? new Date(selected) : undefined
  }, [selected])

  // 格式化时间显示
  const formatDisplayTime = React.useCallback((dateString?: string) => {
    if (!dateString) return placeholder

    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    let display = `${year}-${month}-${day}`

    if (precision !== 'date') {
      const hour = String(date.getHours()).padStart(2, '0')
      display += ` ${hour}`

      if (precision !== 'hour') {
        const minute = String(date.getMinutes()).padStart(2, '0')
        display += `:${minute}`

        if (precision === 'second') {
          const second = String(date.getSeconds()).padStart(2, '0')
          display += `:${second}`
        }
      }
    }

    return display
  }, [placeholder, precision])

  // 选择日期（临时选择，不立即提交）
  const handleDateSelect = React.useCallback((date?: Date) => {
    setTempSelectedDate(date)

    // 如果只是选择日期，立即提交
    if (precision === 'date') {
      if (date) {
        onSelect?.(date.toISOString())
      } else {
        onSelect?.(undefined)
      }
      setOpen(false)
    }
    // 如果还需要选择时间，保持弹窗打开
  }, [precision, onSelect])

  // 处理时间变化
  const handleTimeChange = React.useCallback((type: 'hour' | 'minute' | 'second', value: string) => {
    setSelectedTime(prev => ({
      ...prev,
      [type]: value
    }))
  }, [])

  // 确认选择
  const handleConfirm = React.useCallback(() => {
    if (tempSelectedDate) {
      let finalDate = new Date(tempSelectedDate)

      if (precision !== 'date') {
        finalDate.setHours(
          parseInt(selectedTime.hour),
          precision !== 'hour' ? parseInt(selectedTime.minute) : 0,
          precision === 'second' ? parseInt(selectedTime.second) : 0,
          0
        )
      }

      onSelect?.(finalDate.toISOString())
    }
    setOpen(false)
  }, [tempSelectedDate, selectedTime, precision, onSelect])

  // 取消选择
  const handleCancel = React.useCallback(() => {
    setTempSelectedDate(undefined)
    setOpen(false)
  }, [])

  // 初始化状态 - 只在组件挂载和selected变化时执行
  React.useEffect(() => {
    if (selectedDate) {
      setSelectedTime({
        hour: String(selectedDate.getHours()).padStart(2, '0'),
        minute: String(selectedDate.getMinutes()).padStart(2, '0'),
        second: String(selectedDate.getSeconds()).padStart(2, '0')
      })
    }
  }, [selected]) // 只监听 selected 字符串

  // 当弹窗打开时，初始化临时选择的日期
  React.useEffect(() => {
    if (open) {
      setTempSelectedDate(selectedDate)
    }
  }, [open, selected]) // 只监听 selected 字符串

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayTime(selected)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <DayPicker
            mode="single"
            selected={tempSelectedDate}
            onSelect={handleDateSelect}
            showOutsideDays
            captionLayout="dropdown"
          />

          {precision !== 'date' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">选择时间</span>
              </div>

              <div className="flex items-center space-x-2">
                <Select value={selectedTime.hour} onValueChange={(value) => handleTimeChange('hour', value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-gray-500">:</span>

                {precision !== 'hour' && (
                  <>
                    <Select value={selectedTime.minute} onValueChange={(value) => handleTimeChange('minute', value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={String(i).padStart(2, '0')}>
                            {String(i).padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {precision === 'second' && (
                      <>
                        <span className="text-gray-500">:</span>
                        <Select value={selectedTime.second} onValueChange={(value) => handleTimeChange('second', value)}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 60 }, (_, i) => (
                              <SelectItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  取消
                </Button>
                <Button size="sm" onClick={handleConfirm} disabled={!tempSelectedDate}>
                  确认
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
