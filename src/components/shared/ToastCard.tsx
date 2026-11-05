import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'warning'

const VARIANTS: Record<ToastVariant, { Icon: typeof AlertCircle; box: string; icon: string }> = {
  success: { Icon: CheckCircle2, box: 'bg-primary/10', icon: 'text-primary' },
  error: { Icon: AlertCircle, box: 'bg-destructive/10', icon: 'text-destructive' },
  warning: { Icon: AlertCircle, box: 'bg-amber-500/10', icon: 'text-amber-500' }
}

interface ToastCardProps {
  variant: ToastVariant
  title: string
  description: string
  onDismiss: () => void
}

export default function ToastCard({ variant, title, description, onDismiss }: ToastCardProps) {
  const { Icon, box, icon } = VARIANTS[variant]
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-lg">
      <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', box)}>
        <Icon size={14} className={icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Button variant="ghost" size="icon-2xs" className="shrink-0" onClick={onDismiss}>
        <X size={14} />
      </Button>
    </div>
  )
}

/** Show a ToastCard through sonner's global `<Toaster>`. */
export function showToast(variant: ToastVariant, title: string, description: string) {
  toast.custom((id) => (
    <ToastCard
      variant={variant}
      title={title}
      description={description}
      onDismiss={() => toast.dismiss(id)}
    />
  ))
}
