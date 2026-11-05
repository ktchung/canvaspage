import { useState } from 'react'
import { useAppStore } from '@/store'
import { exportDocumentToPdf } from '@/lib/exportPdf'
import { showToast } from '@/components/shared/ToastCard'

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
      const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'canvaspage.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('success', 'PDF downloaded', 'canvaspage.pdf')
    } catch (err) {
      showToast('error', 'Export failed', (err as Error).message)
    } finally {
      setExporting(false)
    }
  }

  return { exporting, canExport, run }
}
