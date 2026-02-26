import type { UserProfile, Tip } from "./types"

const PROFILE_KEY = "devshare_profile"
const TIPS_KEY = "devshare_tips"
const SAVED_KEY = "devshare_saved"

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(PROFILE_KEY)
  return data ? JSON.parse(data) : null
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function getTips(): Tip[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(TIPS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveTips(tips: Tip[]): void {
  localStorage.setItem(TIPS_KEY, JSON.stringify(tips))
}

export function addTip(tip: Tip): void {
  const tips = getTips()
  saveTips([tip, ...tips])
}

export function updateTip(updated: Tip): void {
  const tips = getTips()
  const idx = tips.findIndex((t) => t.id === updated.id)
  if (idx !== -1) {
    tips[idx] = updated
    saveTips(tips)
  }
}

export function getSavedIds(): string[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(SAVED_KEY)
  return data ? JSON.parse(data) : []
}

export function toggleSaved(tipId: string): boolean {
  const ids = getSavedIds()
  const idx = ids.indexOf(tipId)
  if (idx === -1) {
    ids.push(tipId)
  } else {
    ids.splice(idx, 1)
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids))
  return idx === -1
}
