import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import TopBar from '@/components/shared/TopBar'
import CanvasStage from '@/components/editor/CanvasStage'
import PagesPanel from '@/components/editor/PagesPanel'
import BottomTray from '@/components/editor/BottomTray'
import GearButton from '@/components/editor/GearButton'
import PageSettingsDialog from '@/components/editor/PageSettingsDialog'
import HelpDialog from '@/components/editor/HelpDialog'
import { useAppStore } from '@/store'

export const Route = createFileRoute('/editor')({
  component: EditorPage
})

function EditorPage() {
  const activePageId = useAppStore((s) => s.activePageId)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title="Editor"
        actions={
          <Button
            variant="ghost"
            size="icon-2xs"
            onClick={() => setHelpOpen(true)}
            aria-label="Canvas shortcuts"
          >
            <HelpCircle size={16} />
          </Button>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col bg-neutral-900 overflow-hidden min-w-0">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden min-w-0 min-h-0">
            <CanvasStage />
            <GearButton onClick={() => setSettingsOpen(true)} />
          </div>
          <BottomTray />
        </div>
        <PagesPanel />
      </div>
      <PageSettingsDialog
        pageId={activePageId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}
