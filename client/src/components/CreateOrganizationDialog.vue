<template>
  <Dialog v-model:open="isOpen" @update:open="$emit('update:open', $event)">
    <DialogTrigger v-if="showTrigger" :as-child="true">
      <slot name="trigger">
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a new organization</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleCreateOrg">
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="name">Organization name</Label>
            <Input id="name" v-model="newOrgName" placeholder="My Organization" required />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Create Organization</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { Plus } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { store } from '@/lib/store'
import { useAuth0 } from '@auth0/auth0-vue'

const props = defineProps<{
  open: boolean
  showTrigger?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'organization-created': [organization: any]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const { getAccessTokenSilently } = useAuth0()
let token: string | undefined
const newOrgName = ref('')

async function handleCreateOrg() {
  if (!token) {
    token = await getAccessTokenSilently()
  }

  if (!token) {
    return false
  }

  const org = await store.createOrg(token, newOrgName.value)
  emit('update:open', false)
  emit('organization-created', org)
  newOrgName.value = ''

  return true
}

// Get token on component mount
getAccessTokenSilently().then((accessToken) => {
  token = accessToken
})
</script>
