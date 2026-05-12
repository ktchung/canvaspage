import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToastCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onDismiss: () => void
}

export default function ToastCard({ icon, title, description, onDismiss }: ToastCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-lg">
      {icon}
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
