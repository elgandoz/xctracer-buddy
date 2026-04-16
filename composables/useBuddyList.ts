import { useLocalStorage } from '@vueuse/core'
import type { BuddySlot } from '~/types'

function defaultSlots(): BuddySlot[] {
  return Array.from({ length: 50 }, (_, i) => ({ slot: i + 1, name: '', radioId: '' }))
}

const _buddies = useLocalStorage<BuddySlot[]>('xctracer-buddies', defaultSlots())
// flashMap: slot number → tick count
const flashMap = ref<Record<number, number>>({})

export function useBuddyList() {
  function updateSlot(slot: number, patch: Partial<Pick<BuddySlot, 'name' | 'radioId'>>) {
    const idx = _buddies.value.findIndex(b => b.slot === slot)
    if (idx !== -1) _buddies.value[idx] = { ..._buddies.value[idx], ...patch }
  }

  function clearSlot(slot: number) {
    updateSlot(slot, { name: '', radioId: '' })
  }

  function moveSlot(fromIndex: number, toIndex: number) {
    const arr = [..._buddies.value]
    const [moved] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, moved)
    _buddies.value = arr.map((b, i) => ({ ...b, slot: i + 1 }))
  }

  function flashSlot(slot: number) {
    flashMap.value = { ...flashMap.value, [slot]: (flashMap.value[slot] ?? 0) + 1 }
  }

  function exportTxt(): string {
    let out = '# Buddy List\n\n'
    for (const b of _buddies.value) {
      out += `Buddy${b.slot}Name=${b.name}\n`
      out += `Buddy${b.slot}RadioID=${b.radioId}\n`
      out += '\n'
    }
    return out
  }

  function loadFromParsed(slots: BuddySlot[]) {
    _buddies.value = slots
  }

  return { buddies: _buddies, flashMap, flashSlot, updateSlot, clearSlot, moveSlot, exportTxt, loadFromParsed }
}

