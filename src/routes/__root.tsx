import { createRootRoute, Outlet } from '@tanstack/react-router'
import Sidebar from '@/components/shared/Sidebar'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <Toaster position="bottom-right" />
    </div>
  )
})
