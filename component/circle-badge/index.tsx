import { cn } from '@/lib/utils'

interface OrderBadgeProps {
  number: number
  className?: string
  active?: boolean
}

export function CircleBadge({ number, className, active = true }: OrderBadgeProps) {
  return (
    <div
      className={cn(
        `inline-flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-black' : 'bg-gray-500'} text-sm font-medium text-white`,
        className,
      )}
    >
      {number}
    </div>
  )
}
