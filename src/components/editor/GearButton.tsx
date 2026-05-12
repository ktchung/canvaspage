import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onClick: () => void
}

export default function GearButton({ onClick }: Props) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4 z-20 shadow-md"
      onClick={onClick}
      title="Page settings"
    >
      <Settings size={16} />
    </Button>
  )
}
