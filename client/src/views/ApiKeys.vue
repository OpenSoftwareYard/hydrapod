<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { store } from '@/lib/store'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRoute } from 'vue-router'
import { DataTable, columns } from '@/components/api-keys-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const route = useRoute()
const { getAccessTokenSilently } = useAuth0()
const isLoading = ref(true)
const isDialogOpen = ref(false)
const newKeyName = ref('')
const newApiKey = ref('')
const showNewKey = ref(false)

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()
    await store.getOrgApiKeys(token, route.params.orgId as string)
  } catch (error) {
    console.error('Failed to fetch API keys:', error)
  } finally {
    isLoading.value = false
  }
})

async function createNewApiKey() {
  try {
    const token = await getAccessTokenSilently()
    const apiKey = await store.createApiKey(token, route.params.orgId as string, newKeyName.value)
    newApiKey.value = apiKey.key
    showNewKey.value = true
    newKeyName.value = ''
  } catch (error) {
    console.error('Failed to create API key:', error)
  }
}

function closeDialog() {
  isDialogOpen.value = false
  showNewKey.value = false
  newApiKey.value = ''
}

function copyToClipboard() {
  navigator.clipboard
    .writeText(newApiKey.value)
    .then(() => {
      // Could add a toast notification here
      console.log('API key copied to clipboard')
    })
    .catch((err) => {
      console.error('Failed to copy API key:', err)
    })
}
</script>

<template>
  <div class="container mx-auto py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">API Keys</h1>
      <Button @click="isDialogOpen = true">Create API Key</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <div v-if="store.orgApiKeys.length === 0" class="text-center py-10">
        <p class="text-muted-foreground">No API keys found. Create one to get started.</p>
      </div>

      <DataTable v-else :columns="columns" :data="store.orgApiKeys" />
    </div>

    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ showNewKey ? 'API Key Created' : 'Create API Key' }}</DialogTitle>
        </DialogHeader>

        <div v-if="!showNewKey" class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input id="name" v-model="newKeyName" placeholder="My API Key" class="col-span-3" />
          </div>
        </div>

        <div v-else class="grid gap-4 py-4">
          <p class="text-sm text-muted-foreground mb-2">
            Make sure to copy your API key now. You won't be able to see it again!
          </p>
          <div class="bg-muted p-3 rounded-md font-mono text-sm break-all">
            {{ newApiKey }}
          </div>
          <Button variant="outline" @click="copyToClipboard"> Copy to Clipboard </Button>
        </div>

        <DialogFooter>
          <Button v-if="!showNewKey" @click="createNewApiKey" :disabled="!newKeyName">
            Create
          </Button>
          <Button v-else @click="closeDialog"> Done </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
