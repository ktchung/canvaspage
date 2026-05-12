import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface Binding {
  keys: string[]
  label: string
}

interface Group {
  title: string
  bindings: Binding[]
}

const groups: Group[] = [
  {
    title: 'Zoom',
    bindings: [
      { keys: ['Ctrl/Cmd', 'Scroll'], label: 'Zoom at cursor' },
      { keys: ['Ctrl/Cmd', '+'], label: 'Zoom in' },
      { keys: ['Ctrl/Cmd', '-'], label: 'Zoom out' }
    ]
  },
  {
    title: 'Pan',
    bindings: [{ keys: ['Right-click', 'Drag'], label: 'Pan canvas while zoomed' }]
  }
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HelpDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Canvas shortcuts</DialogTitle>
          <DialogDescription>
            Keyboard and mouse shortcuts for the editor canvas.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <section key={group.title} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.bindings.map((b) => (
                  <li
                    key={b.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground">{b.label}</span>
                    <span className="flex items-center gap-1">
                      {b.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-muted-foreground">+</span>}
                          <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs text-foreground">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
