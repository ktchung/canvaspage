import Konva from 'konva'
import { PDFDocument } from 'pdf-lib'
import { A4_W, A4_H, type DocumentPage, type ImageItem } from '@/store'

const A4_PDF_W = 595.28
const A4_PDF_H = 841.89

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

async function preloadImages(
  pages: DocumentPage[],
  images: ImageItem[]
): Promise<Map<string, HTMLImageElement>> {
  const needed = new Set<string>()
  for (const p of pages) for (const ci of p.canvasImages) needed.add(ci.imageId)
  const pathById = new Map(images.map((i) => [i.id, i.url]))
  const entries = await Promise.all(
    [...needed].map(async (id) => {
      const path = pathById.get(id)
      if (!path) return null
      const el = await loadImage(path)
      return [id, el] as const
    })
  )
  return new Map(entries.filter((e): e is readonly [string, HTMLImageElement] => e !== null))
}

function renderPageToDataURL(
  page: DocumentPage,
  imgEls: Map<string, HTMLImageElement>
): string {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-99999px'
  container.style.top = '0'
  document.body.appendChild(container)

  const stage = new Konva.Stage({ container, width: A4_W, height: A4_H })
  const layer = new Konva.Layer({
    clipFunc: (ctx) => ctx.rect(0, 0, A4_W, A4_H)
  })
  stage.add(layer)

  layer.add(
    new Konva.Rect({ x: 0, y: 0, width: A4_W, height: A4_H, fill: '#ffffff' })
  )

  const sorted = [...page.canvasImages].sort((a, b) => a.zIndex - b.zIndex)
  for (const ci of sorted) {
    const img = imgEls.get(ci.imageId)
    if (!img) continue
    layer.add(
      new Konva.Image({
        image: img,
        x: ci.x,
        y: ci.y,
        width: ci.width,
        height: ci.height
      })
    )
  }

  layer.draw()
  const dataURL = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })

  stage.destroy()
  container.remove()
  return dataURL
}

export async function exportDocumentToPdf(
  pages: DocumentPage[],
  images: ImageItem[]
): Promise<Uint8Array> {
  const imgEls = await preloadImages(pages, images)
  const pdf = await PDFDocument.create()
  for (const page of pages) {
    const dataURL = renderPageToDataURL(page, imgEls)
    const png = await pdf.embedPng(dataURL)
    const pdfPage = pdf.addPage([A4_PDF_W, A4_PDF_H])
    pdfPage.drawImage(png, { x: 0, y: 0, width: A4_PDF_W, height: A4_PDF_H })
  }
  return await pdf.save()
}
