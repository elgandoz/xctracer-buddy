import { useLocalStorage } from '@vueuse/core'
import type { Contact } from '~/types'

export function useContacts() {
  const contacts = useLocalStorage<Contact[]>('xctracer-contacts', [])

  function addContact(name: string, radioId: string): Contact {
    const c: Contact = { id: crypto.randomUUID(), name, radioId }
    contacts.value.push(c)
    return c
  }

  function updateContact(id: string, patch: Partial<Pick<Contact, 'name' | 'radioId'>>) {
    const idx = contacts.value.findIndex(c => c.id === id)
    if (idx !== -1) contacts.value[idx] = { ...contacts.value[idx], ...patch }
  }

  function removeContact(id: string) {
    contacts.value = contacts.value.filter(c => c.id !== id)
  }

  function findByRadioId(radioId: string): Contact | undefined {
    return contacts.value.find(c => c.radioId.toLowerCase() === radioId.toLowerCase())
  }

  function exportTxt(): string {
    let out = '# Buddy List\n\n'
    for (let i = 0; i < 50; i++) {
      const c = contacts.value[i]
      out += `Buddy${i + 1}Name=${c?.name ?? ''}\n`
      out += `Buddy${i + 1}RadioID=${c?.radioId ?? ''}\n`
      out += '\n'
    }
    return out
  }

  return { contacts, addContact, updateContact, removeContact, findByRadioId, exportTxt }
}
