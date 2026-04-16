import type { BuddySlot } from '~/types'

export function parseBuddyListTxt(text: string): BuddySlot[] {
  const blocks = text.split(/\n\n/)
  const dataBlocks = blocks.slice(1).filter(b => b.trim())
  const slots: BuddySlot[] = Array.from({ length: 50 }, (_, i) => ({ slot: i + 1, name: '', radioId: '' }))

  for (let i = 0; i < Math.min(dataBlocks.length, 50); i++) {
    const lines = dataBlocks[i].split('\n').filter(l => l.trim())
    const nameLine = lines[0] ?? ''
    const radioLine = lines[1] ?? ''
    const name = nameLine.includes('=') ? nameLine.split('=').slice(1).join('=') : ''
    const radioId = radioLine.includes('=') ? radioLine.split('=').slice(1).join('=').toUpperCase() : ''
    slots[i] = { slot: i + 1, name, radioId }
  }

  return slots
}
