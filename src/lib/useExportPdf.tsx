import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/store'
import { exportDocumentToPdf } from '@/lib/exportPdf'
import ToastCard from '@/components/shared/ToastCard'

export function useExportPdf() {
  const pages = useAppStore((s) => s.pages)
  const images = useAppStore((s) => s.images)
  const [exporting, setExporting] = useState(false)

  const canExport = pages.length > 0

  async function run() {
    if (exporting || !canExport) return
    setExporting(true)
    try {
      const bytes = await exportDocumentToPdf(pages, images)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'canvaspage.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.custom((id) => (
        <ToastCard
          icon={
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <CheckCircle2 size={14} className="text-primary" />
            </div>
          }
          title="PDF downloaded"
          description="canvaspage.pdf"
          onDismiss={() => toast.dismiss(id)}
        />
      ))
    } catch (err) {
      const message = (err as Error).message
      toast.custom((id) => (
        <ToastCard
          icon={
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">
              <AlertCircle size={14} className="text-destructive" />
            </div>
          }
          title="Export failed"
          description={message}
          onDismiss={() => toast.dismiss(id)}
        />
      ))
    } finally {
      setExporting(false)
    }
  }

  return { exporting, canExport, run }
}
