'use client'

import { useState } from 'react'
import { Input } from '@/component/input'
import { Button } from '@/component/button'
import { Label } from '@/component/label'
import { Plus, X } from 'lucide-react'

interface UrlLinkProps {
	value?: string[]
	onChange?: (urls: string[]) => void
	label?: string
	placeholder?: string
	className?: string
	maxUrls?: number
}

export function UrlLink({
	value = [''],
	onChange,
	label = "网络链接",
	placeholder = "请输入URL链接",
	className = "",
	maxUrls = 10
}: UrlLinkProps) {
	const [urls, setUrls] = useState<string[]>(value)
	const [errors, setErrors] = useState<string[]>([])

	const validateUrl = (url: string): string => {
		if (!url.trim()) return ''

		try {
			new URL(url)
			return ''
		} catch {
			return '请输入有效的URL格式'
		}
	}

	const handleUrlChange = (index: number, url: string) => {
		const newUrls = [...urls]
		newUrls[index] = url
		setUrls(newUrls)

		// 验证URL
		const newErrors = [...errors]
		newErrors[index] = validateUrl(url)
		setErrors(newErrors)

		onChange?.(newUrls.filter(u => u.trim()))
	}

	const addUrl = () => {
		if (urls.length < maxUrls) {
			const newUrls = [...urls, '']
			setUrls(newUrls)
			setErrors([...errors, ''])
			onChange?.(newUrls.filter(u => u.trim()))
		}
	}

	const removeUrl = (index: number) => {
		if (urls.length > 1) {
			const newUrls = urls.filter((_, i) => i !== index)
			const newErrors = errors.filter((_, i) => i !== index)
			setUrls(newUrls)
			setErrors(newErrors)
			onChange?.(newUrls.filter(u => u.trim()))
		}
	}

	return (
		<div className={`space-y-3 ${className}`}>
			<Label>{label}</Label>
			<div className="space-y-2">
				{urls.map((url, index) => (
					<div key={index} className="flex items-center space-x-2">
						<div className="flex-1">
							<Input
								type="url"
								value={url}
								onChange={(e) => handleUrlChange(index, e.target.value)}
								placeholder={placeholder}
								className={errors[index] ? 'border-red-500' : ''}
							/>
							{errors[index] && (
								<p className="text-red-500 text-xs mt-1">{errors[index]}</p>
							)}
						</div>
						{index === urls.length - 1 && urls.length < maxUrls && (
							<Button
								variant="outline"
								size="sm"
								onClick={addUrl}
								className="h-10 w-10 p-0"
							>
								<Plus className="w-4 h-4" />
							</Button>
						)}
						{urls.length > 1 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => removeUrl(index)}
								className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
							>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				))}
			</div>
		</div>
	)
} 