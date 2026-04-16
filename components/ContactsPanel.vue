<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h2 class="text-white font-semibold">Contacts</h2>
      <span class="text-gray-400 text-xs">{{ contacts.length }} contacts</span>
    </div>
    <div class="flex gap-2">
      <UButton size="xs" icon="i-heroicons-plus" @click="addContact('', '')">Add Contact</UButton>
      <UButton size="xs" icon="i-heroicons-arrow-up-tray" color="neutral" variant="soft" @click="fileInput?.click()">
        Upload BuddyList.txt
      </UButton>
      <input ref="fileInput" type="file" accept=".txt" class="hidden" @change="handleFileUpload" />
    </div>
    <div class="flex flex-col gap-0.5">
      <ContactRow
        v-for="contact in contacts"
        :key="contact.id"
        :contact="contact"
        @update="patch => updateContact(contact.id, patch)"
        @remove="removeContact(contact.id)"
        @add-to-buddies="addToBuddies(contact)"
      />
    </div>
    <UButton class="w-full" icon="i-heroicons-arrow-down-tray" color="neutral" variant="soft" @click="handleDownload">
      Download as BuddyList.txt
    </UButton>

    <!-- Conflict modal -->
    <UModal v-model:open="showConflict" title="Contact Conflict">
      <template #body>
        <div v-if="currentConflict" class="space-y-4 text-sm">
          <p class="text-gray-300">A contact with RadioID <code class="text-sky-400">{{ currentConflict.incoming.radioId }}</code> already exists.</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-800 rounded p-3">
              <p class="text-gray-400 text-xs mb-1">Existing</p>
              <p class="font-semibold">{{ currentConflict.existing.name }}</p>
              <p class="font-mono text-xs text-gray-400">{{ currentConflict.existing.radioId }}</p>
            </div>
            <div class="bg-gray-800 rounded p-3">
              <p class="text-gray-400 text-xs mb-1">Incoming</p>
              <p class="font-semibold">{{ currentConflict.incoming.name }}</p>
              <p class="font-mono text-xs text-gray-400">{{ currentConflict.incoming.radioId }}</p>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <UButton size="sm" color="neutral" variant="soft" @click="resolveConflict('keep')">Keep Existing</UButton>
            <UButton size="sm" color="primary" @click="resolveConflict('use')">Use Incoming</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { parseBuddyListTxt } from '~/composables/useBuddyListParser'
import type { Contact } from '~/types'

const { contacts, addContact, updateContact, removeContact, findByRadioId, exportTxt } = useContacts()
const { buddies, loadFromParsed, updateSlot } = useBuddyList()
const { downloadTxt, readUploadedFile } = useFileIO()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)

interface ConflictItem {
  existing: Contact
  incoming: { name: string; radioId: string }
}

const conflictQueue = ref<ConflictItem[]>([])
const showConflict = ref(false)
const currentConflict = ref<ConflictItem | null>(null)

function nextConflict() {
  if (conflictQueue.value.length > 0) {
    currentConflict.value = conflictQueue.value.shift()!
    showConflict.value = true
  }
}

function resolveConflict(action: 'keep' | 'use') {
  if (currentConflict.value && action === 'use') {
    updateContact(currentConflict.value.existing.id, {
      name: currentConflict.value.incoming.name,
      radioId: currentConflict.value.incoming.radioId
    })
  }
  showConflict.value = false
  currentConflict.value = null
  nextConflict()
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
  const emptySlot = buddies.value.find(b => !b.name && !b.radioId)
  if (!emptySlot) {
    toast.add({ title: 'Buddy list is full (50/50)', color: 'error' })
    return
  }
  updateSlot(emptySlot.slot, { name: contact.name, radioId: contact.radioId })
  toast.add({ title: `Added ${contact.name} to buddy list`, color: 'success' })
}

function handleDownload() {
  downloadTxt('BuddyList.txt', exportTxt())
}
</script>
