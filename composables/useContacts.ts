import { useLocalStorage } from '@vueuse/core'
import type { Contact } from '~/types'

const _contacts = useLocalStorage<Contact[]>('xctracer-contacts', [])
// flashMap: contactId → tick count (increments each flash, row watches for changes)
const flashMap = ref<Record<string, number>>({})

export function useContacts() {
  function addContact(name: string, radioId: string, atTop = false): Contact {
    const c: Contact = { id: crypto.randomUUID(), name, radioId }
    if (atTop) _contacts.value.unshift(c)
    else _contacts.value.push(c)
    return c
  }

  function updateContact(id: string, patch: Partial<Pick<Contact, 'name' | 'radioId'>>) {
    const idx = _contacts.value.findIndex(c => c.id === id)
    if (idx !== -1) _contacts.value[idx] = { ..._contacts.value[idx], ...patch }
  }

  function removeContact(id: string) {
    _contacts.value = _contacts.value.filter(c => c.id !== id)
  }

  function findByRadioId(radioId: string): Contact | undefined {
    return _contacts.value.find(c => c.radioId.toLowerCase() === radioId.toLowerCase())
  }

  function sortAlpha() {
    _contacts.value = [..._contacts.value].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    )
  }

  function flashContact(id: string) {
    flashMap.value = { ...flashMap.value, [id]: (flashMap.value[id] ?? 0) + 1 }
  }

  function exportTxt(): string {
    let out = '# Buddy List\n\n'
    for (let i = 0; i < 50; i++) {
      const c = _contacts.value[i]
      out += `Buddy${i + 1}Name=${c?.name ?? ''}\n`
      out += `Buddy${i + 1}RadioID=${c?.radioId ?? ''}\n`
      out += '\n'
    }
    return out
  }

  return { contacts: _contacts, flashMap, addContact, updateContact, removeContact, findByRadioId, sortAlpha, flashContact, exportTxt }
}
