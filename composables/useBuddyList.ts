import { useLocalStorage } from '@vueuse/core'
import type { BuddySlot } from '~/types'

function defaultSlots(): BuddySlot[] {
  return Array.from({ length: 50 }, (_, i) => ({ slot: i + 1, name: '', radioId: '' }))
}

export function useBuddyList() {
  const buddies = useLocalStorage<BuddySlot[]>('xctracer-buddies', defaultSlots())

  function updateSlot(slot: number, patch: Partial<Pick<BuddySlot, 'name' | 'radioId'>>) {
    const idx = buddies.value.findIndex(b => b.slot === slot)
    if (idx !== -1) buddies.value[idx] = { ...buddies.value[idx], ...patch }
  }

  function clearSlot(slot: number) {
    updateSlot(slot, { name: '', radioId: '' })
  }

  function moveSlot(fromIndex: number, toIndex: number) {
    const arr = [...buddies.value]
    const [moved] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, moved)
    buddies.value = arr.map((b, i) => ({ ...b, slot: i + 1 }))
  }

  function exportTxt(): string {
    let out = '# Buddy List\n\n'
    for (const b of buddies.value) {
      out += `Buddy${b.slot}Name=${b.name}\n`
      out += `Buddy${b.slot}RadioID=${b.radioId}\n`
      out += '\n'
    }
    return out
  }

  function loadFromParsed(slots: BuddySlot[]) {
    buddies.value = slots
  }

  return { buddies, updateSlot, clearSlot, moveSlot, exportTxt, loadFromParsed }
}
