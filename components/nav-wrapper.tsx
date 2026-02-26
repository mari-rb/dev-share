"use client"

import { Suspense } from "react"
import { AppSidebar } from "./app-sidebar"
import { MobileHeader } from "./mobile-header"

export function NavWrapper() {
  return (
    <>
      <Suspense fallback={null}>
        <div className="hidden md:block">
          <AppSidebar />
        </div>
      </Suspense>
      <Suspense fallback={null}>
        <MobileHeader />
      </Suspense>
    </>
  )
}
