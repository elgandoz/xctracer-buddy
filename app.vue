<template>
  <UApp>
    <div class="min-h-screen bg-gray-950 text-white">
      <!-- Header -->
      <header class="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sky-400 font-bold text-lg">✈ XCTracer Buddy Manager</span>
          <UBadge color="sky" variant="soft" size="xs" label="PWA" />
        </div>
        <span class="text-gray-400 text-sm hidden md:block">Manage your XCTracer Maxx buddy list — works offline</span>
        <div class="ml-auto">
          <UTooltip text="How to use">
            <UButton icon="i-heroicons-question-mark-circle" color="neutral" variant="ghost" @click="showHelp = true" />
          </UTooltip>
        </div>
      </header>

      <!-- Main: side-by-side panels -->
      <main class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-screen-xl mx-auto">
        <BuddyListPanel />
        <ContactsPanel />
      </main>

      <!-- Help modal -->
      <UModal v-model:open="showHelp" title="How to use">
        <template #body>
          <ol class="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>Upload your existing <code>BuddyList.txt</code> in the Contacts panel to import your contacts.</li>
            <li>Manage your address book in the <strong>Contacts</strong> panel (right). Add, edit, or remove contacts freely.</li>
            <li>In the <strong>Buddy List</strong> panel (left), compose up to 50 slots for your next flight by clicking <em>Add to Buddies</em> on any contact.</li>
            <li>Drag rows or use ↑↓ buttons to reorder buddy slots.</li>
            <li>Download <code>BuddyList.txt</code> and copy it to your XCTracer Maxx SD card (<code>/XCTRACER/</code> folder).</li>
          </ol>
        </template>
      </UModal>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const showHelp = ref(false)
</script>
