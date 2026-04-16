<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">Contacts</h2>
      <div class="flex items-center gap-2">
        <UButton size="xs" icon="i-heroicons-bars-arrow-down" color="neutral" variant="ghost" title="Sort contacts alphabetically by name" @click="sortAlpha">A→Z</UButton>
        <span class="text-[--ui-text-muted] text-xs">{{ contacts.length }} contacts</span>
      </div>
    </div>
    <div class="flex gap-2">
      <UButton size="xs" icon="i-heroicons-plus" title="Add a new empty contact at the top" @click="handleAddContact">Add Contact</UButton>
      <UButton size="xs" icon="i-heroicons-arrow-up-tray" color="neutral" variant="soft" title="Import a BuddyList.txt — contacts will be merged into your address book" @click="fileInput?.click()">
        Import
      </UButton>
      <UButton size="xs" icon="i-heroicons-arrow-down-tray" color="neutral" variant="soft" title="Export your full contact list as BuddyList-export.txt" @click="handleDownload">
        Export
      </UButton>
      <input ref="fileInput" type="file" accept=".txt" class="hidden" @change="handleFileUpload" />
    </div>
    <div class="flex flex-col gap-0.5">
      <ContactRow
        v-for="contact in contacts"
        :key="contact.id"
        :contact="contact"
        :flash-tick="contactFlashMap[contact.id]"
        @update="patch => updateContact(contact.id, patch)"
        @remove="removeContact(contact.id)"
        @add-to-buddies="addToBuddies(contact)"
      />
    </div>

    <!-- Conflict modal -->
    <UModal v-model:open="showConflict" title="Import Conflict">
      <template #body>
        <div v-if="currentConflict" class="space-y-4 text-sm">
          <div class="flex items-center justify-between">
            <p>Same RadioID found in your contacts:</p>
            <UBadge v-if="conflictQueue.length > 0" color="warning" variant="soft" size="xs">
              +{{ conflictQueue.length }} more
            </UBadge>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[--ui-bg-elevated] rounded p-3 space-y-1">
              <p class="text-[--ui-text-muted] text-xs font-medium uppercase tracking-wide">Existing</p>
              <p class="font-semibold">{{ currentConflict.existing.name }}</p>
              <p class="font-mono text-xs text-[--ui-text-muted]">{{ currentConflict.existing.radioId }}</p>
            </div>
            <div class="bg-[--ui-bg-elevated] rounded p-3 space-y-1">
              <p class="text-[--ui-text-muted] text-xs font-medium uppercase tracking-wide">Incoming</p>
              <p class="font-semibold">{{ currentConflict.incoming.name }}</p>
              <p class="font-mono text-xs text-[--ui-text-muted]">{{ currentConflict.incoming.radioId }}</p>
            </div>
          </div>

          <!-- Single resolution -->
          <div class="flex gap-2">
            <UButton class="flex-1" size="sm" color="neutral" variant="soft" title="Keep the existing contact, skip this incoming entry" @click="resolveConflict('keep', applyToAll)">Keep Existing</UButton>
            <UButton class="flex-1" size="sm" color="primary" title="Replace the existing contact with the incoming entry" @click="resolveConflict('use', applyToAll)">Use Incoming</UButton>
          </div>

          <!-- Bulk resolution — only shown when there are more conflicts queued -->
          <template v-if="conflictQueue.length > 0">
            <div class="border-t border-[--ui-border] pt-3">
              <label class="flex items-center gap-2 cursor-pointer select-none text-[--ui-text-muted]">
                <UCheckbox v-model="applyToAll" />
                <span>Apply my choice to all {{ conflictQueue.length }} remaining conflicts</span>
              </label>
            </div>
          </template>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { parseBuddyListTxt } from '~/composables/useBuddyListParser'
import type { Contact } from '~/types'

const { contacts, flashMap: contactFlashMap, addContact, updateContact, removeContact, findByRadioId, sortAlpha, flashContact, exportTxt } = useContacts()
const { buddies, loadFromParsed, updateSlot, flashSlot } = useBuddyList()
const { downloadTxt, readUploadedFile } = useFileIO()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)

function handleAddContact() {
  const emptyContact = contacts.value.find(c => !c.name && !c.radioId)
  if (emptyContact) {
    flashContact(emptyContact.id)
    return
  }
  addContact('', '', true)
}

interface ConflictItem {
  existing: Contact
  incoming: { name: string; radioId: string }
}

const conflictQueue = ref<ConflictItem[]>([])
const showConflict = ref(false)
const currentConflict = ref<ConflictItem | null>(null)
const applyToAll = ref(false)

function applyResolution(conflict: ConflictItem, action: 'keep' | 'use') {
  if (action === 'use') {
    updateContact(conflict.existing.id, {
      name: conflict.incoming.name,
      radioId: conflict.incoming.radioId
    })
  }
}

function nextConflict() {
  applyToAll.value = false
  if (conflictQueue.value.length > 0) {
    currentConflict.value = conflictQueue.value.shift()!
    showConflict.value = true
  } else {
    showConflict.value = false
    currentConflict.value = null
  }
}

function resolveConflict(action: 'keep' | 'use', applyAll: boolean) {
  if (!currentConflict.value) return
  applyResolution(currentConflict.value, action)

  if (applyAll) {
    // Drain the entire queue with the same action
    for (const conflict of conflictQueue.value) {
      applyResolution(conflict, action)
    }
    conflictQueue.value = []
    showConflict.value = false
    currentConflict.value = null
  } else {
    currentConflict.value = null
    nextConflict()
  }
}

async function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const text = await readUploadedFile(file)
  const slots = parseBuddyListTxt(text)
  loadFromParsed(slots)
  let added = 0
  for (const slot of slots) {
    if (!slot.name && !slot.radioId) continue
    const existing = slot.radioId ? findByRadioId(slot.radioId) : undefined
    if (existing) {
      conflictQueue.value.push({ existing, incoming: { name: slot.name, radioId: slot.radioId } })
    } else {
      addContact(slot.name, slot.radioId)
      added++
    }
  }
  toast.add({ title: `Imported ${added} contacts`, color: 'success' })
  ;(e.target as HTMLInputElement).value = ''
  nextConflict()
}

function addToBuddies(contact: Contact) {
  // Check if already in buddy list by radioId
  const duplicate = buddies.value.find(b => b.radioId && b.radioId.toLowerCase() === contact.radioId.toLowerCase())
  if (duplicate) {
    toast.add({ title: `${contact.name || contact.radioId} is already in slot ${duplicate.slot}`, color: 'warning' })
    flashSlot(duplicate.slot)
    return
  }

  const emptySlot = buddies.value.find(b => !b.name && !b.radioId)
  if (!emptySlot) {
    toast.add({ title: 'Buddy list is full (50/50)', color: 'error' })
    return
  }
  updateSlot(emptySlot.slot, { name: contact.name, radioId: contact.radioId })
  flashSlot(emptySlot.slot)
  toast.add({ title: `Added ${contact.name || contact.radioId} to slot ${emptySlot.slot}`, color: 'success' })
}

function handleDownload() {
  downloadTxt('BuddyList-export.txt', exportTxt())
}
</script>
