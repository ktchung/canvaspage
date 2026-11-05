import { Toaster as Sonner, type ToasterProps } from "sonner"

// Toasts are rendered with toast.custom(<ToastCard />) (see components/shared/ToastCard.tsx),
// which bypasses sonner's built-in styling and icons, so none are configured here.
const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme="dark" className="toaster group" {...props} />
}

export { Toaster }
