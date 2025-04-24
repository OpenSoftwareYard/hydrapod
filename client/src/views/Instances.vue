<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { store } from '@/lib/store'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRoute } from 'vue-router'
import { DataTable } from '@/components/data-table'
import { columns } from '@/components/data-table/columns'
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
const newZone = ref({
  brand: '',
  imageUri: '',
  cpuCount: 1,
  ramGB: 1,
  diskGB: 10,
  services: [
    {
      name: '',
      description: '',
      workingDir: '',
      command: '',
      arguments: '',
      user: 'root',
      environment: '',
      environmentVars: [{ key: '', value: '' }],
    },
  ],
})

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()
    await store.getOrgZones(token, route.params.orgId as string)
  } catch (error) {
    console.error('Failed to fetch zones:', error)
  } finally {
    isLoading.value = false
  }
})

// Function to format environment variables in the required format
function formatEnvironmentVars() {
  const envVars = newZone.value.services[0].environmentVars
  // Filter out empty entries
  const validEnvVars = envVars.filter((env) => env.key.trim() !== '')

  // Format as "Environment="KEY=value"\nEnvironment="KEY2=value2""
  return validEnvVars.map((env) => `Environment="${env.key}=${env.value}"`).join('\n')
}

// Add a new environment variable field
function addEnvironmentVar() {
  newZone.value.services[0].environmentVars.push({ key: '', value: '' })
}

// Remove an environment variable field
function removeEnvironmentVar(index: number) {
  if (newZone.value.services[0].environmentVars.length > 1) {
    newZone.value.services[0].environmentVars.splice(index, 1)
  }
}

async function createNewZone() {
  try {
    // Format environment variables before sending to backend
    newZone.value.services[0].environment = formatEnvironmentVars()

    // Create a clean copy of the zone data without environmentVars
    const zoneToSend = JSON.parse(JSON.stringify(newZone.value))
    // Remove environmentVars from each service
    zoneToSend.services.forEach((service: { environmentVars?: any }) => {
      delete service.environmentVars
    })

    const token = await getAccessTokenSilently()
    await store.createZone(token, route.params.orgId as string, zoneToSend)
    isDialogOpen.value = false
    // Reset form
    newZone.value = {
      brand: '',
      imageUri: '',
      cpuCount: 1,
      ramGB: 1,
      diskGB: 10,
      services: [
        {
          name: '',
          description: '',
          workingDir: '',
          command: '',
          arguments: '',
          user: 'root',
          environment: '',
          environmentVars: [{ key: '', value: '' }],
        },
      ],
    }
  } catch (error) {
    console.error('Failed to create zone:', error)
  }
}
</script>

<template>
  <div class="container mx-auto py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Instances</h1>
      <Button @click="isDialogOpen = true">Create Instance</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <div v-if="store.orgZones.length === 0" class="text-center py-10">
        <p class="text-muted-foreground">No instances found. Create one to get started.</p>
      </div>

      <DataTable v-else :columns="columns" :data="store.orgZones" />
    </div>

    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Instance</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <h3 class="text-lg font-medium">Instance Details</h3>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="brand" class="text-right">Brand</Label>
            <Input id="brand" v-model="newZone.brand" placeholder="Ubuntu" class="col-span-3" />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="imageUri" class="text-right">Image URI</Label>
            <Input
              id="imageUri"
              v-model="newZone.imageUri"
              placeholder="ubuntu-22.04"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="cpuCount" class="text-right">CPU Cores</Label>
            <Input
              id="cpuCount"
              v-model.number="newZone.cpuCount"
              type="number"
              min="1"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="ramGB" class="text-right">RAM (GB)</Label>
            <Input
              id="ramGB"
              v-model.number="newZone.ramGB"
              type="number"
              min="1"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="diskGB" class="text-right">Disk (GB)</Label>
            <Input
              id="diskGB"
              v-model.number="newZone.diskGB"
              type="number"
              min="10"
              class="col-span-3"
            />
          </div>

          <h3 class="text-lg font-medium mt-4">Service Configuration</h3>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="serviceName" class="text-right">Name</Label>
            <Input
              id="serviceName"
              v-model="newZone.services[0].name"
              placeholder="web-server"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="serviceDescription" class="text-right">Description</Label>
            <Input
              id="serviceDescription"
              v-model="newZone.services[0].description"
              placeholder="Web server service"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="workingDir" class="text-right">Working Directory</Label>
            <Input
              id="workingDir"
              v-model="newZone.services[0].workingDir"
              placeholder="/opt/app"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="command" class="text-right">Command</Label>
            <Input
              id="command"
              v-model="newZone.services[0].command"
              placeholder="node"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="arguments" class="text-right">Arguments</Label>
            <Input
              id="arguments"
              v-model="newZone.services[0].arguments"
              placeholder="server.js"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="user" class="text-right">User</Label>
            <Input
              id="user"
              v-model="newZone.services[0].user"
              placeholder="root"
              class="col-span-3"
            />
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <Label class="text-right">Environment Variables</Label>
              <Button type="button" variant="outline" size="sm" @click="addEnvironmentVar">
                Add Variable
              </Button>
            </div>

            <div
              v-for="(envVar, index) in newZone.services[0].environmentVars"
              :key="index"
              class="grid grid-cols-9 items-center gap-2"
            >
              <Input v-model="envVar.key" placeholder="KEY" class="col-span-4" />
              <span class="text-center">=</span>
              <Input v-model="envVar.value" placeholder="value" class="col-span-3" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                @click="removeEnvironmentVar(index)"
                :disabled="newZone.services[0].environmentVars.length === 1"
                class="h-8 w-8"
              >
                <span class="text-lg">×</span>
              </Button>
            </div>

            <div
              v-if="newZone.services[0].environmentVars.some((env) => env.key.trim() !== '')"
              class="mt-2 p-2 bg-muted rounded text-xs font-mono whitespace-pre"
            >
              {{ formatEnvironmentVars() }}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            @click="createNewZone"
            :disabled="
              !newZone.brand ||
              !newZone.imageUri ||
              newZone.cpuCount < 1 ||
              newZone.ramGB < 1 ||
              newZone.diskGB < 10 ||
              !newZone.services[0].name ||
              !newZone.services[0].workingDir ||
              !newZone.services[0].command ||
              !newZone.services[0].user
            "
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
