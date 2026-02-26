"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Compass,
  PlusCircle,
  Bookmark,
  UserCircle,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getProfile } from "@/lib/storage"

const navItems = [
  { href: "/", label: "Explorar", icon: Compass },
  { href: "/new-tip", label: "Postar", icon: PlusCircle },
  { href: "/saved", label: "Salvos", icon: Bookmark },
  { href: "/profile", label: "Perfil", icon: UserCircle },
]

export function MobileHeader() {
  const pathname = usePathname()
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    setHasProfile(!!getProfile())
  }, [pathname])

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-2.5 border-b border-border bg-sidebar px-4 py-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
          DevShare
        </span>
      </header>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-sidebar px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          // Mostrar apenas "Perfil" se não tiver perfil
          if (!hasProfile && item.href !== "/profile") {
            return null
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
