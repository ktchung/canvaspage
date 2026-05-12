import type { ReactNode } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExportPdf } from '@/lib/useExportPdf'

interface TopBarProps {
  title: string
  actions?: ReactNode
}

export default function TopBar({ title, actions }: TopBarProps) {
  const { exporting, canExport, run } = useExportPdf()
  const disabled = exporting || !canExport

  return (
    <header className="flex h-10 items-center gap-2 border-b border-border bg-card px-4">
      <span className="flex-1 text-sm text-accent-foreground">{title}</span>
      {actions}
      <Button size="icon-2xs" onClick={run} disabled={disabled}>
        {exporting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
      </Button>
    </header>
  )
}
