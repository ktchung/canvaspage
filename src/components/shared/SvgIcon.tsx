import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface SvgIconProps extends HTMLAttributes<HTMLSpanElement> {
  src: string
}

export default function SvgIcon({ src, className, ...props }: SvgIconProps) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full', className)}
      dangerouslySetInnerHTML={{ __html: src }}
      {...props}
    />
  )
}
