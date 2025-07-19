'use client'

import { useState } from 'react'
import { Input } from '@/component/input'
import { Label } from '@/component/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/select'

interface Duration {
	hours: number
	minutes: number
}

interface DurationProps {
	value?: Duration
	onChange?: (duration: Duration) => void
	label?: string
	className?: string
}

export function Duration({ value, onChange, label = "预计耗时", className = "" }: DurationProps) {
	const [duration, setDuration] = useState<Duration>(value || { hours: 0, minutes: 0 })

	const handleHoursChange = (hours: string) => {
		const newDuration = { ...duration, hours: parseInt(hours) || 0 }
		setDuration(newDuration)
		onChange?.(newDuration)
	}

	const handleMinutesChange = (minutes: string) => {
		const newDuration = { ...duration, minutes: parseInt(minutes) || 0 }
		setDuration(newDuration)
		onChange?.(newDuration)
	}

	return (
		<div className={`space-y-2 ${className}`}>
			<Label>{label}</Label>
			<div className="flex items-center space-x-2">
				<div className="flex-1">
					<Input
						type="number"
						min="0"
						max="999"
						value={duration.hours}
						onChange={(e) => handleHoursChange(e.target.value)}
						placeholder="0"
						className="text-center"
					/>
				</div>
				<span className="text-sm text-gray-600">小时</span>
				<span className="text-gray-500">:</span>
				<div className="flex-1">
					<Input
						type="number"
						min="0"
						max="59"
						value={duration.minutes}
						onChange={(e) => handleMinutesChange(e.target.value)}
						placeholder="0"
						className="text-center"
					/>
				</div>
				<span className="text-sm text-gray-600">分钟</span>
			</div>
		</div>
	)
} 