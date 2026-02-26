"use client"

import { useEffect } from "react"
import { getTips, saveTips } from "@/lib/storage"
import { MOCK_TIPS } from "@/lib/mock-data"

export function DataInitializer() {
  useEffect(() => {
    const existing = getTips()
    if (existing.length === 0) {
      saveTips(MOCK_TIPS)
    }
  }, [])

  return null
}
