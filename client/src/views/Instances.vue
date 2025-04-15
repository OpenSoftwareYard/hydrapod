<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { store } from '@/lib/store'
import { useAuth0 } from '@auth0/auth0-vue'
import { useRoute } from 'vue-router'
import { DataTable } from '@/components/data-table'
import { columns } from '@/components/data-table/columns'

const route = useRoute()
const { getAccessTokenSilently } = useAuth0()
const isLoading = ref(true)

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
</script>

<template>
  <div class="container mx-auto py-10">
    <h1 class="text-2xl font-bold mb-6">Instances</h1>

    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else>
      <div v-if="store.orgZones.length === 0" class="text-center py-10">
        <p class="text-muted-foreground">No instances found.</p>
      </div>

      <DataTable v-else :columns="columns" :data="store.orgZones" />
    </div>
  </div>
</template>
