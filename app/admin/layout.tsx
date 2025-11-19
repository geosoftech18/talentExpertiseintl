import { Suspense } from "react"
import AdminLayout from "@/components/admin-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen theme-bg"><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></div>}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  )
}

