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
  { href: "/new-tip", label: "Postar Dica", icon: PlusCircle },
  { href: "/saved", label: "Salvos", icon: Bookmark },
  { href: "/profile", label: "Perfil", icon: UserCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    setHasProfile(!!getProfile())
  }, [pathname])

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
          DevShare
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
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
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-6 py-4">
        <p className="text-xs text-muted-foreground">
          DevShare v1.0
        </p>
      </div>
    </aside>
  )
}
