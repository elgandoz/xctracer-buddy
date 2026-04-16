<template>
  <UApp>
    <div class="min-h-screen">
      <!-- Header -->
      <header class="border-b border-[--ui-border] px-4 py-3 flex items-center gap-3 bg-[--ui-bg]">
        <div class="flex items-center gap-2">
          <span class="text-primary font-bold text-lg">✈ XCTracer Buddy Manager</span>
          <UBadge color="primary" variant="soft" size="xs" label="PWA" />
        </div>
        <span class="text-[--ui-text-muted] text-sm hidden md:block">Manage your XCTracer Maxx buddy list — works offline</span>
        <div class="ml-auto flex items-center gap-1">
          <UTooltip :text="`Color mode: ${colorMode.preference}`">
            <UButton :icon="colorModeIcon" color="neutral" variant="ghost" @click="cycleColorMode" />
          </UTooltip>
          <UTooltip text="How to use">
            <UButton icon="i-heroicons-question-mark-circle" color="neutral" variant="ghost" @click="showHelp = true" />
          </UTooltip>
        </div>
      </header>

      <!-- Main: side-by-side panels -->
      <main class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-screen-xl mx-auto">
        <UCard>
          <BuddyListPanel />
        </UCard>
        <UCard>
          <ContactsPanel />
        </UCard>
      </main>

      <!-- Help modal -->
      <UModal v-model:open="showHelp" title="How to use">
        <template #body>
          <ol class="list-decimal list-inside space-y-2 text-sm">
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
const colorMode = useColorMode()

const colorModeIcon = computed(() => ({
  light: 'i-heroicons-sun',
  dark: 'i-heroicons-moon',
  system: 'i-heroicons-computer-desktop'
}[colorMode.preference] ?? 'i-heroicons-computer-desktop'))

function cycleColorMode() {
  const modes = ['system', 'light', 'dark'] as const
  const idx = modes.indexOf(colorMode.preference as typeof modes[number])
  colorMode.preference = modes[(idx + 1) % modes.length]
}
</script>

