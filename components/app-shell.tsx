"use client"

import { ProfileGuard } from "./profile-guard"
import { NavWrapper } from "./nav-wrapper"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProfileGuard>
      <div className="min-h-screen bg-background">
        <NavWrapper />
        <main className="pb-20 md:ml-64 md:pb-0">
          <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </ProfileGuard>
  )
}
