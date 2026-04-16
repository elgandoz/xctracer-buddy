<template>
  <div class="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-800 transition-colors">
    <UInput
      v-model="localName"
      size="xs"
      placeholder="Name"
      :class="nameTooLong ? 'ring-2 ring-yellow-500' : ''"
      @blur="emit('update', { name: localName, radioId: localRadioId })"
    />
    <UTooltip :text="radioIdError || ''" :disabled="!radioIdError">
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
    <UButton size="xs" icon="i-heroicons-arrow-right" color="primary" variant="soft" @click="emit('addToBuddies')">
      Add
    </UButton>
    <UButton size="xs" icon="i-heroicons-trash" color="error" variant="ghost" @click="emit('remove')" />
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '~/types'
import { radioIdError as getRadioIdError } from '~/utils/validation'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{
  update: [patch: { name: string; radioId: string }]
  remove: []
  addToBuddies: []
}>()

const localName = ref(props.contact.name)
const localRadioId = ref(props.contact.radioId)

watch(() => props.contact, (c) => {
  localName.value = c.name
  localRadioId.value = c.radioId
})

const nameTooLong = computed(() => localName.value.length > 16)
const radioIdError = computed(() => getRadioIdError(localRadioId.value))
</script>
