<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h2 class="text-white font-semibold">Buddy List</h2>
      <span class="text-gray-400 text-xs">{{ filledCount }} / 50 slots used</span>
    </div>
    <div ref="listEl" class="flex flex-col gap-0.5">
      <BuddyRow
        v-for="(buddy, i) in buddies"
        :key="buddy.slot"
        :buddy="buddy"
        :index="i"
        :is-first="i === 0"
        :is-last="i === buddies.length - 1"
        @update="patch => updateSlot(buddy.slot, patch)"
        @clear="clearSlot(buddy.slot)"
        @move-up="moveSlot(i, i - 1)"
        @move-down="moveSlot(i, i + 1)"
      />
    </div>
    <UButton class="w-full" icon="i-heroicons-arrow-down-tray" @click="handleDownload">
      Download BuddyList.txt
    </UButton>
  </section>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs'

const { buddies, updateSlot, clearSlot, moveSlot, exportTxt } = useBuddyList()
const { downloadTxt } = useFileIO()

const filledCount = computed(() => buddies.value.filter(b => b.name || b.radioId).length)

const listEl = ref<HTMLElement | null>(null)

onMounted(() => {
  if (listEl.value) {
    Sortable.create(listEl.value, {
      handle: '.drag-handle',
      animation: 150,
      onEnd(evt) {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          moveSlot(evt.oldIndex, evt.newIndex)
        }
      }
    })
  }
})

function handleDownload() {
  downloadTxt('BuddyList.txt', exportTxt())
}
</script>
