<template>
  <div :class="['flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-800 transition-colors', isEmpty && 'opacity-50']">
    <span class="drag-handle cursor-grab text-gray-500 hover:text-gray-300">
      <UIcon name="i-heroicons-bars-3" class="w-4 h-4" />
    </span>
    <UBadge :label="String(buddy.slot)" color="neutral" variant="soft" size="xs" class="w-6 text-center shrink-0" />
    <UInput
      v-model="localName"
      size="xs"
      placeholder="Name"
      :class="nameTooLong ? 'ring-2 ring-yellow-500' : ''"
      @update:model-value="emit('update', { name: $event as string, radioId: localRadioId })"
    />
    <UTooltip :text="radioIdError || ''" :disabled="!radioIdError">
      <UInput
        v-model="localRadioId"
        size="xs"
        placeholder="RadioID"
        class="font-mono uppercase"
        :class="radioIdError ? 'ring-2 ring-red-500' : ''"
        @update:model-value="val => { localRadioId = (val as string).toUpperCase(); emit('update', { name: localName, radioId: localRadioId }) }"
      />
    </UTooltip>
    <UButton icon="i-heroicons-chevron-up" size="xs" color="neutral" variant="ghost" :disabled="isFirst" @click="emit('moveUp')" />
    <UButton icon="i-heroicons-chevron-down" size="xs" color="neutral" variant="ghost" :disabled="isLast" @click="emit('moveDown')" />
    <UButton icon="i-heroicons-x-mark" size="xs" color="error" variant="ghost" @click="emit('clear')" />
  </div>
</template>

<script setup lang="ts">
import type { BuddySlot } from '~/types'
import { radioIdError as getRadioIdError } from '~/utils/validation'

const props = defineProps<{
  buddy: BuddySlot
  index: number
  isFirst: boolean
  isLast: boolean
}>()
const emit = defineEmits<{
  update: [patch: { name: string; radioId: string }]
  clear: []
  moveUp: []
  moveDown: []
}>()

const localName = ref(props.buddy.name)
const localRadioId = ref(props.buddy.radioId)

watch(() => props.buddy, (b) => {
  localName.value = b.name
  localRadioId.value = b.radioId
})

const isEmpty = computed(() => !localName.value && !localRadioId.value)
const nameTooLong = computed(() => localName.value.length > 16)
const radioIdError = computed(() => getRadioIdError(localRadioId.value))
</script>
