import { AlertCircle } from 'lucide-react'
import ToastCard from '@/components/shared/ToastCard'

interface UploadErrorToastProps {
  title: string
  description: string
  onDismiss: () => void
}

export default function UploadErrorToast({ title, description, onDismiss }: UploadErrorToastProps) {
  return (
    <ToastCard
      icon={
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
          <AlertCircle size={14} className="text-amber-500" />
        </div>
      }
      title={title}
      description={description}
      onDismiss={onDismiss}
    />
  )
}
