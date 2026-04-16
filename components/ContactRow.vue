<template>
  <div
    :key="animKey"
    :class="[
      'flex items-center gap-2 py-1 px-2 rounded transition-colors',
      isEmpty ? 'opacity-50' : 'hover:bg-[--ui-bg-elevated]',
      animKey > 0 && 'slot-flash'
    ]"
  >
    <UButton size="xs" icon="i-heroicons-arrow-left" color="primary" variant="soft" title="Add to buddy list" @click="emit('addToBuddies')" />
    <UInput
      v-model="localName"
      size="xs"
      placeholder="Name"
      :class="nameTooLong ? 'ring-2 ring-yellow-500' : ''"
      :title="nameTooLong ? 'Name exceeds 16 characters — may be truncated on device' : 'Contact name'"
      @blur="emit('update', { name: localName, radioId: localRadioId })"
    />
    <UTooltip :text="radioIdError || 'FANET+ / ADS-L Radio ID (4–6 hex characters)'">
      <UInput
        v-model="localRadioId"
        size="xs"
        placeholder="RadioID"
        class="font-mono uppercase"
        :class="radioIdError ? 'ring-2 ring-red-500' : ''"
        @blur="emit('update', { name: localName, radioId: localRadioId.toUpperCase() })"
        @update:model-value="val => localRadioId = (val as string).toUpperCase()"
      />
    </UTooltip>
    <UButton size="xs" icon="i-heroicons-trash" color="error" variant="ghost" title="Remove contact" @click="emit('remove')" />
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '~/types'
import { radioIdError as getRadioIdError } from '~/utils/validation'

const props = defineProps<{ contact: Contact; flashTick?: number }>()
const emit = defineEmits<{
  update: [patch: { name: string; radioId: string }]
  remove: []
  addToBuddies: []
}>()

const localName = ref(props.contact.name)
const localRadioId = ref(props.contact.radioId)
const animKey = ref(0)

watch(() => props.contact, (c) => {
  localName.value = c.name
  localRadioId.value = c.radioId
})

watch(() => props.flashTick, (val) => {
  if (!val) return
  animKey.value++
})

const isEmpty = computed(() => !localName.value && !localRadioId.value)
const nameTooLong = computed(() => localName.value.length > 16)
const radioIdError = computed(() => getRadioIdError(localRadioId.value))
</script>
