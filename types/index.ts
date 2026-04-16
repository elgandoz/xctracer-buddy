export interface BuddySlot {
  slot: number       // 1–50
  name: string
  radioId: string    // 6-char uppercase hex, may be empty string
}

export interface Contact {
  id: string         // uuid (crypto.randomUUID())
  name: string
  radioId: string
}
