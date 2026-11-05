import { cn } from '@/lib/utils'

interface SelectCheckboxProps {
  checked: boolean
  /** Classes for the unchecked state (background/border). */
  uncheckedClassName: string
  className?: string
  iconClassName?: string
}

/** Visual-only selection checkbox used by gallery grid cards and list rows. */
export default function SelectCheckbox({
  checked,
  uncheckedClassName,
  className,
  iconClassName
}: SelectCheckboxProps) {
  return (
    <div
      className={cn(
        'rounded border-2 flex items-center justify-center transition-colors',
        checked ? 'bg-primary border-primary' : uncheckedClassName,
        className
      )}
    >
      {checked && (
        <svg
          className={cn('text-white', iconClassName)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  )
}
