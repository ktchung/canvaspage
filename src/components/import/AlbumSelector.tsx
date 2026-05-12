import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Album } from '@/store'

type AlbumMode = 'existing' | 'new'

interface AlbumSelectorProps {
  albums: Album[]
  selectedAlbumId: string
  onAlbumIdChange: (id: string) => void
  newAlbumName: string
  onNewAlbumNameChange: (name: string) => void
  mode: AlbumMode
  onModeChange: (mode: AlbumMode) => void
}

export default function AlbumSelector({
  albums,
  selectedAlbumId,
  onAlbumIdChange,
  newAlbumName,
  onNewAlbumNameChange,
  mode,
  onModeChange
}: AlbumSelectorProps) {
  const hasExisting = albums.length > 0

  return (
    <RadioGroup value={mode} onValueChange={(v) => onModeChange(v as AlbumMode)} className="gap-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="existing" id="existing" disabled={!hasExisting} />
          <Label
            htmlFor="existing"
            className={`font-medium ${hasExisting ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            Existing Album
          </Label>
        </div>
        {mode === 'existing' && (
          <div className="pl-6">
            <Select value={selectedAlbumId} onValueChange={onAlbumIdChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select album…" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="cursor-pointer font-medium">
            New Album
          </Label>
        </div>
        {mode === 'new' && (
          <div className="pl-6">
            <Input
              className="w-full"
              placeholder="Enter album name"
              value={newAlbumName}
              onChange={(e) => onNewAlbumNameChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </RadioGroup>
  )
}

export type { AlbumMode }
