<template>
  <div class="container max-w-5xl py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Organizations</h1>
        <p class="text-muted-foreground mt-1">Select an organization or create a new one</p>
      </div>
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger :as-child="true">
          <Button>
            <Plus class="mr-2 h-4 w-4" />
            Create Organization
          </Button>
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
              Select <ArrowRight class="h-4 w-4" />
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
        <Dialog v-model:open="isDialogOpen">
          <DialogTrigger :as-child="true">
            <Button>Create Your First Organization</Button>
          </DialogTrigger>
        </Dialog>
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
import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'
import DialogTrigger from '@/components/ui/dialog/DialogTrigger.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { store } from '@/lib/store'
import { ArrowRight, Building, Plus, Users } from 'lucide-vue-next'
import { ref } from 'vue'

import { useAuth0 } from '@auth0/auth0-vue'

const { getAccessTokenSilently } = useAuth0()
let token: string | undefined

const isDialogOpen = ref(false)
const newOrgName = ref('')

async function handleCreateOrg() {
  if (!token) {
    return false
  }
  const org = await store.createOrg(token, newOrgName.value)
  isDialogOpen.value = false

  return true
}

getAccessTokenSilently().then((accessToken) => {
  token = accessToken
  store.getUserOrgs(token).then(() => {})
})
</script>
