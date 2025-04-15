<template>
  <div class="container max-w-5xl py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Organizations</h1>
        <p class="text-muted-foreground mt-1">Select an organization or create a new one</p>
      </div>
      <CreateOrganizationDialog
        v-model:open="isDialogOpen"
        :show-trigger="true"
        @organization-created="onOrganizationCreated"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3" v-if="store.userOrgs.length > 0">
      <RouterLink
        :to="`/organizations/${org.id}`"
        key="{{ org.id }}"
        class="block"
        v-for="org in store.userOrgs"
      >
        <Card class="h-full transition-all hover:border-primary hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary mr-3"
              >
                <Building class="h-6 w-6" />
              </div>
              ORG NAME
            </CardTitle>
            <CardDescription>
              <span class="inline-block px-2 py-1 text-xs rounded-full bg-muted">ORG ROLE</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-sm text-muted-foreground">
              <div class="flex items-center mb-1">
                <Users class="h-4 w-4 mr-1" />
                4 members
              </div>
              <div>15 instances</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" class="w-full justify-between">
              Select
              <ArrowRight class="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </RouterLink>
    </div>
    <Card class="text-center p-8" v-else>
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Building class="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 class="mt-6 text-xl font-semibold">No Organizations</h2>
      <p class="mt-2 text-muted-foreground">You are not a member of any organizations yet.</p>
      <div class="mt-6">
        <CreateOrganizationDialog
          v-model:open="isDialogOpen"
          @organization-created="onOrganizationCreated"
        >
          <template #trigger>
            <Button>Create Your First Organization</Button>
          </template>
        </CreateOrganizationDialog>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardFooter from '@/components/ui/card/CardFooter.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CreateOrganizationDialog from '@/components/CreateOrganizationDialog.vue'
import { store } from '@/lib/store'
import { ArrowRight, Building, Users } from 'lucide-vue-next'
import { ref } from 'vue'

import { useAuth0 } from '@auth0/auth0-vue'

const { getAccessTokenSilently } = useAuth0()
let token: string | undefined

const isDialogOpen = ref(false)

function onOrganizationCreated() {
  // Refresh the organizations list
  if (token) {
    store.getUserOrgs(token)
  }
}

getAccessTokenSilently().then((accessToken) => {
  token = accessToken
  store.getUserOrgs(token).then(() => {})
})
</script>
