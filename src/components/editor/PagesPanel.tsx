import { Fragment, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/store'
import PageThumbnail from './PageThumbnail'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export default function PagesPanel() {
  const pages = useAppStore((s) => s.pages)
  const activePageId = useAppStore((s) => s.activePageId)
  const setActivePage = useAppStore((s) => s.setActivePage)
  const addPage = useAppStore((s) => s.addPage)
  const deletePage = useAppStore((s) => s.deletePage)
  const reorderPages = useAppStore((s) => s.reorderPages)

  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = pages.findIndex((p) => p.id === active.id)
    const newIdx = pages.findIndex((p) => p.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const ids = arrayMove(pages.map((p) => p.id), oldIdx, newIdx)
    reorderPages(ids)
  }

  const askDelete = (id: string) => {
    const page = pages.find((p) => p.id === id)
    if (!page) return
    if (page.canvasImages.length === 0) {
      deletePage(id)
      return
    }
    setPendingDelete(id)
  }

  return (
    <aside className="flex h-full w-[120px] shrink-0 flex-col overflow-y-auto border-l border-border bg-card">
      <div className="px-3 pt-3 pb-2 text-[10px] font-semibold tracking-widest text-muted-foreground">
        PAGES
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col items-center gap-2 px-3 pb-3">
            {pages.map((p, idx) => (
              <Fragment key={p.id}>
                <PageThumbnail
                  page={p}
                  index={idx}
                  active={p.id === activePageId}
                  onSelect={() => setActivePage(p.id)}
                  onDelete={() => askDelete(p.id)}
                />
                <button
                  className="flex h-5 w-[88px] items-center justify-center rounded border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                  onClick={() => addPage(p.id)}
                  title="Insert page"
                >
                  <Plus size={12} />
                </button>
              </Fragment>
            ))}
            {pages.length === 0 && (
              <button
                className="flex aspect-[794/1123] w-[88px] items-center justify-center rounded-sm border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                onClick={() => addPage()}
                title="Add page"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => { if (!o) setPendingDelete(null) }}
      >
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              This page has content that will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete) deletePage(pendingDelete)
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
