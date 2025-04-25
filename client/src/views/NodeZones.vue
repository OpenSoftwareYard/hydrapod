<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { store } from '@/lib/store'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Node, PhysicalZone } from '@/lib/types'

const route = useRoute()
const router = useRouter()
const { getAccessTokenSilently } = useAuth0()
const isLoading = ref(true)
const zones = ref<PhysicalZone[]>([])
const nodeId = route.params.nodeId as string
const node = ref<Node | null>(null)

// Load zones for this node on component mount
onMounted(async () => {
  try {
    const token = await getAccessTokenSilently()

    // Get node details
    node.value = await store.getNode(token, nodeId)

    // Get zones for this node
    zones.value = await store.getNodeZones(token, nodeId)
  } catch (error) {
    console.error('Failed to fetch zones for node:', error)
  } finally {
    isLoading.value = false
  }
})

// Go back to nodes list
function goBack() {
  router.push('/admin/nodes')
}
</script>

<template>
  <div class="container mx-auto py-10">
    <div class="flex justify-between items-center mb-6">
      <div>
        <Button variant="outline" class="mb-2" @click="goBack">← Back to Nodes</Button>
        <h1 class="text-2xl font-bold">Zones on Node: {{ node?.address || nodeId }}</h1>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <div v-if="!zones.length" class="text-center py-10">
        <p class="text-muted-foreground">No zones found on this node.</p>
      </div>

      <div v-else>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>RAM (GB)</TableHead>
              <!-- <TableHead>Status</TableHead> -->
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="zone in zones" :key="zone.zonename">
              <TableCell>{{ zone.zonename }}</TableCell>
              <TableCell>{{ zone.brand }}</TableCell>
              <TableCell>{{ zone['capped-cpu']?.ncpus }}</TableCell>
              <TableCell>{{ zone['capped-memory']?.physical }}</TableCell>
              <!-- <TableCell>
                <span :class="{
                  'px-2 py-1 rounded text-xs font-medium': true,
                  'bg-green-100 text-green-800': zone.status === 'running',
                  'bg-red-100 text-red-800': zone.status === 'stopped',
                  'bg-yellow-100 text-yellow-800': zone.status === 'pending' || zone.status === 'unknown'
                }">
                  {{ zone.status }}
                </span>
              </TableCell> -->
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>
