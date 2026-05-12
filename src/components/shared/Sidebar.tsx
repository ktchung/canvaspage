import { Link } from '@tanstack/react-router'
import editorSvg from '@/assets/icons/editor.svg?raw'
import gallerySvg from '@/assets/icons/gallery.svg?raw'
import importSvg from '@/assets/icons/import.svg?raw'
import SvgIcon from '@/components/shared/SvgIcon'

const navItems = [
  { to: '/editor', label: 'Editor', icon: editorSvg },
  { to: '/gallery', label: 'Gallery', icon: gallerySvg },
  { to: '/import', label: 'Import', icon: importSvg }
] as const

export default function Sidebar() {
  return (
    <aside className="flex w-48 flex-col border-r border-border bg-card px-3 py-4">
      <div className="mb-6 px-2 text-lg tracking-tight">CanvasPage</div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
          >
            <SvgIcon src={icon} className="h-[15px] w-[15px]" />
            {label}
          </Link>
        ))}
      </nav>
      <span className="mt-auto px-2 text-xs text-muted-foreground">v{__APP_VERSION__}</span>
    </aside>
  )
}
