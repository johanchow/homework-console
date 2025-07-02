import * as React from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

const ProgressRoot = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-8 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-200',
      className,
    )}
    {...props}
  />
))

ProgressRoot.displayName = ProgressPrimitive.Root.displayName

const ProgressIndicator = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Indicator>
>(({ className, style, ...props }, ref) => (
  <ProgressPrimitive.Indicator
    ref={ref}
    className={cn('h-full bg-white', className)}
    style={style}
    {...props}
  />
))

ProgressIndicator.displayName = ProgressPrimitive.Indicator.displayName

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const { value } = props
  const progressNum = value ? value / 100 : 0
  return (
    <ProgressRoot ref={ref} className={cn(className)} {...props}>
      <ProgressIndicator style={{ transform: `translateX(-${100 - progressNum}%)` }} />
    </ProgressRoot>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { ProgressIndicator, ProgressRoot, Progress }
