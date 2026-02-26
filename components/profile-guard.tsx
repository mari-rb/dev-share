"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getProfile } from "@/lib/storage"

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const profile = getProfile()
    const isProfilePage = pathname === "/profile"

    // Se não tem perfil e não está na página de perfil, redirecionar para cadastro
    if (!profile && !isProfilePage) {
      router.replace("/profile")
    }
  }, [mounted, pathname, router])

  // Renderizar sempre durante a hidratação
  return <>{children}</>
}
