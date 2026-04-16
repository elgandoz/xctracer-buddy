<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">Buddy List</h2>
      <span class="text-[--ui-text-muted] text-xs">{{ filledCount }} / 50 slots used</span>
    </div>
    <UButton class="w-full" icon="i-heroicons-arrow-down-tray" title="Download BuddyList.txt for copying to your XCTracer Maxx SD card" @click="handleDownload">
      Download BuddyList.txt
    </UButton>
    <div ref="listEl" class="flex flex-col gap-0.5">
      <BuddyRow
        v-for="(buddy, i) in buddies"
        :key="buddy.slot"
        :buddy="buddy"
        :index="i"
        :is-first="i === 0"
        :is-last="i === buddies.length - 1"
        :flash-tick="flashMap[buddy.slot]"
        @update="patch => updateSlot(buddy.slot, patch)"
        @clear="clearSlot(buddy.slot)"
        @move-up="moveSlot(i, i - 1)"
        @move-down="moveSlot(i, i + 1)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs'

const { buddies, flashMap, updateSlot, clearSlot, moveSlot, exportTxt } = useBuddyList()
const { downloadTxt } = useFileIO()

const filledCount = computed(() => buddies.value.filter(b => b.name || b.radioId).length)
const listEl = ref<HTMLElement | null>(null)

let sortable: Sortable | null = null
let _nextSibling: Element | null = null

function initSortable() {
  sortable?.destroy()
  sortable = null
  if (!listEl.value) return
  sortable = Sortable.create(listEl.value, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'invisible',
    onStart(evt) {
      // Capture where the element sits before the drag, so we can revert
      _nextSibling = evt.item.nextElementSibling
    },
    onEnd(evt) {
      const { oldIndex, newIndex } = evt
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return
      // Revert SortableJS's DOM change — put the element back where it started.
      // Vue will then re-render the correct order from reactive state.
      evt.from.insertBefore(evt.item, _nextSibling)
      moveSlot(oldIndex, newIndex)
    }
  })
}

onMounted(() => initSortable())
onUnmounted(() => sortable?.destroy())

function handleDownload() {
  downloadTxt('BuddyList.txt', exportTxt())
}
</script>

