import { Trash2, FolderMinus, Pencil } from 'lucide-react'
import allImagesSvg from '@/assets/icons/all-images.svg?raw'
import gridViewSvg from '@/assets/icons/grid-view.svg?raw'
import listViewSvg from '@/assets/icons/list-view.svg?raw'
import SvgIcon from '@/components/shared/SvgIcon'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Album } from '@/store'

interface GalleryToolbarProps {
  albums: Album[]
  albumFilter: string
  onAlbumChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  selectedCount: number
  onBulkDelete: () => void
  onRenameAlbum: (album: Album) => void
  onDeleteAlbum: (album: Album) => void
}

export default function GalleryToolbar({
  albums,
  albumFilter,
  onAlbumChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onBulkDelete,
  onRenameAlbum,
  onDeleteAlbum
}: GalleryToolbarProps) {
  const selectedAlbum = albumFilter !== 'all' ? albums.find((a) => a.id === albumFilter) : null
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-2">
      <Select value={albumFilter} onValueChange={onAlbumChange}>
        <SelectTrigger size="sm" className="w-44">
          <SvgIcon src={allImagesSvg} className="h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Images</SelectItem>
          {albums.map((album) => (
            <SelectItem key={album.id} value={album.id}>
              {album.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1">
        {selectedAlbum && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onRenameAlbum(selectedAlbum)}
              title={`Rename album "${selectedAlbum.name}"`}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeleteAlbum(selectedAlbum)}
              title={`Delete album "${selectedAlbum.name}"`}
            >
              <FolderMinus className="size-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={selectedCount === 0}
          onClick={onBulkDelete}
          className="relative"
        >
          <Trash2 className="size-4" />
          {selectedCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {selectedCount}
            </span>
          )}
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'outline' : 'ghost'}
          size="icon-sm"
          onClick={() => onViewModeChange('grid')}
          className={viewMode === 'grid' ? 'text-accent-foreground' : ''}
        >
          <SvgIcon src={gridViewSvg} className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'outline' : 'ghost'}
          size="icon-sm"
          onClick={() => onViewModeChange('list')}
          className={viewMode === 'list' ? 'text-accent-foreground' : ''}
        >
          <SvgIcon src={listViewSvg} className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
