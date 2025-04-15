<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar/index'

import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar/index'

import {
  BookOpen,
  Bot,
  Computer,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
} from 'lucide-vue-next'

import { useAuth0 } from '@auth0/auth0-vue'
import { store } from '@/lib/store'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const { user, getAccessTokenSilently } = useAuth0()

let token: string | undefined

getAccessTokenSilently().then((accessToken) => {
  token = accessToken
  store.getUserOrgs(token).then(() => {})
})

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

const teams = computed(() => {
  return store.userOrgs.map((org) => ({
    name: org.name,
    logo: GalleryVerticalEnd,
    plan: 'Startup',
    id: org.id,
  }))
})

const activeTeam = computed(() => {
  return teams.value.find((team) => {
    return team.id == route.params.orgId
  })
})

// This is sample data.
const data = reactive({
  user: {
    name: user.value!.name!,
    email: user.value!.email!,
    avatar: user.value!.picture!,
  },
  navMain: [
    {
      title: 'Compute',
      url: '#',
      icon: Computer,
      isActive: true,
      items: [
        {
          title: 'Instances',
          url: `/organizations/${route.params.orgId}/instances`,
        },
      ],
    },
  ],
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="teams" :active-team="activeTeam" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
