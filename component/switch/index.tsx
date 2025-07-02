'use client'

import * as React from 'react'
import { Switch as SwitchPrimitives } from 'radix-ui'

import { cn } from '@/lib/utils'

const SwitchThumb = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Thumb>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Thumb>
>(({ className, children, ...props }, ref) => (
  <SwitchPrimitives.Thumb
    ref={ref}
    className={cn(
      'peer block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      className,
    )}
    {...props}
  >
    {children}
  </SwitchPrimitives.Thumb>
))

SwitchThumb.displayName = SwitchPrimitives.Thumb.displayName

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, children, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-stone-50 data-[state=unchecked]:bg-stone-50',
      className,
    )}
    {...props}
    ref={ref}
  >
    {children ? (
      children
    ) : (
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    )}
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch, SwitchThumb }
