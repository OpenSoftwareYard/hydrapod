<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from '@/lib/store'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRouter } from 'vue-router'
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
import { DataTable, nodeColumns } from '@/components/data-table'
import type { Node } from '@/lib/types'

const router = useRouter()
const { getAccessTokenSilently } = useAuth0()
const isLoading = ref(true)
const isDialogOpen = ref(false)
const isEditMode = ref(false)
const selectedNode = ref<Node | null>(null)

// Form data for creating/editing a node
const nodeForm = ref({
  address: '',
  port: 22,
  connectionKey: '',
  connectionUser: '',
  externalNetworkDevice: '',
  internalStubDevice: '',
  defRouter: '',
  privateZoneNetwork: '',
  zoneBasePath: '',
  totalCpu: 0,
  totalRamGB: 0,
  totalDiskGB: 0,
})

// Load nodes on component mount
// Event handler functions
const handleEditNode = ((event: CustomEvent) => {
  openEditDialog(event.detail)
}) as EventListener

const handleViewNodeZones = ((event: CustomEvent) => {
  viewNodeZones(event.detail)
}) as EventListener

const handleDeleteNode = ((event: CustomEvent) => {
  deleteNode(event.detail)
}) as EventListener

onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()
    await store.getNodes(token)

    // Set up event listeners for DataTable actions
    window.addEventListener('edit-node', handleEditNode)
    window.addEventListener('view-node-zones', handleViewNodeZones)
    window.addEventListener('delete-node', handleDeleteNode)
  } catch (error) {
    console.error('Failed to fetch nodes:', error)
  } finally {
    isLoading.value = false
  }
})

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  window.removeEventListener('edit-node', handleEditNode)
  window.removeEventListener('view-node-zones', handleViewNodeZones)
  window.removeEventListener('delete-node', handleDeleteNode)
})

// Open dialog for creating a new node
function openCreateDialog() {
  isEditMode.value = false
  resetForm()
  isDialogOpen.value = true
}

// Open dialog for editing an existing node
function openEditDialog(node: Node) {
  isEditMode.value = true
  selectedNode.value = node

  // Populate form with node data
  nodeForm.value = {
    address: node.address,
    port: node.port,
    connectionKey: '', // We don't display the connection key for security reasons
    connectionUser: node.connectionUser,
    externalNetworkDevice: node.externalNetworkDevice,
    internalStubDevice: node.internalStubDevice,
    defRouter: node.defRouter,
    privateZoneNetwork: node.privateZoneNetwork,
    zoneBasePath: node.zoneBasePath,
    totalCpu: node.totalCpu,
    totalRamGB: node.totalRamGB,
    totalDiskGB: node.totalDiskGB,
  }

  isDialogOpen.value = true
}

// Reset form to default values
function resetForm() {
  nodeForm.value = {
    address: '',
    port: 22,
    connectionKey: '',
    connectionUser: '',
    externalNetworkDevice: '',
    internalStubDevice: '',
    defRouter: '',
    privateZoneNetwork: '',
    zoneBasePath: '',
    totalCpu: 0,
    totalRamGB: 0,
    totalDiskGB: 0,
  }
}

// Close dialog and reset form
function closeDialog() {
  isDialogOpen.value = false
  resetForm()
}

// Create a new node
async function createNode() {
  try {
    const token = await getAccessTokenSilently()
    await store.createNode(token, nodeForm.value)
    closeDialog()
  } catch (error) {
    console.error('Failed to create node:', error)
  }
}

// Update an existing node
async function updateNode() {
  if (!selectedNode.value) return

  try {
    const token = await getAccessTokenSilently()
    await store.updateNode(token, selectedNode.value.id, nodeForm.value)
    closeDialog()
  } catch (error) {
    console.error('Failed to update node:', error)
  }
}

// Delete a node
async function deleteNode(nodeId: string) {
  if (!confirm('Are you sure you want to delete this node?')) return

  try {
    const token = await getAccessTokenSilently()
    await store.deleteNode(token, nodeId)
  } catch (error) {
    console.error('Failed to delete node:', error)
  }
}

// View zones for a specific node
function viewNodeZones(nodeId: string) {
  router.push(`/admin/nodes/${nodeId}/zones`)
}
</script>

<template>
  <div class="container mx-auto py-10">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Node Management</h1>
      <Button @click="openCreateDialog">Add Node</Button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <div v-if="store.nodes.length === 0" class="text-center py-10">
        <p class="text-muted-foreground">No nodes found. Add a node to get started.</p>
      </div>

      <div v-else>
        <DataTable :columns="nodeColumns" :data="store.nodes" />
      </div>
    </div>

    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? 'Edit Node' : 'Add Node' }}</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="address" class="text-right">Address</Label>
            <Input
              id="address"
              v-model="nodeForm.address"
              placeholder="192.168.1.100"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="port" class="text-right">Port</Label>
            <Input id="port" v-model.number="nodeForm.port" type="number" class="col-span-3" />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="connectionUser" class="text-right">User</Label>
            <Input
              id="connectionUser"
              v-model="nodeForm.connectionUser"
              placeholder="root"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="connectionKey" class="text-right">SSH Key</Label>
            <Input
              id="connectionKey"
              v-model="nodeForm.connectionKey"
              type="password"
              :placeholder="isEditMode ? '(unchanged)' : 'SSH private key'"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="externalNetworkDevice" class="text-right">External Network</Label>
            <Input
              id="externalNetworkDevice"
              v-model="nodeForm.externalNetworkDevice"
              placeholder="eth0"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="internalStubDevice" class="text-right">Internal Stub</Label>
            <Input
              id="internalStubDevice"
              v-model="nodeForm.internalStubDevice"
              placeholder="eth1"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="defRouter" class="text-right">Default Router</Label>
            <Input
              id="defRouter"
              v-model="nodeForm.defRouter"
              placeholder="192.168.1.1"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="privateZoneNetwork" class="text-right">Private Network</Label>
            <Input
              id="privateZoneNetwork"
              v-model="nodeForm.privateZoneNetwork"
              placeholder="10.0.0.0/24"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="zoneBasePath" class="text-right">Zone Base Path</Label>
            <Input
              id="zoneBasePath"
              v-model="nodeForm.zoneBasePath"
              placeholder="/zones"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="totalCpu" class="text-right">Total CPU</Label>
            <Input
              id="totalCpu"
              v-model.number="nodeForm.totalCpu"
              type="number"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="totalRamGB" class="text-right">Total RAM (GB)</Label>
            <Input
              id="totalRamGB"
              v-model.number="nodeForm.totalRamGB"
              type="number"
              class="col-span-3"
            />
          </div>

          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="totalDiskGB" class="text-right">Total Disk (GB)</Label>
            <Input
              id="totalDiskGB"
              v-model.number="nodeForm.totalDiskGB"
              type="number"
              class="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDialog">Cancel</Button>
          <Button v-if="isEditMode" @click="updateNode">Update</Button>
          <Button v-else @click="createNode">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
