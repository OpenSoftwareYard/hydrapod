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
import { decodeToken, extractRoles, hasAdminRole } from '@/lib/auth'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const { user, getAccessTokenSilently } = useAuth0()

let token: string | undefined
const userRoles = ref<string[]>([])
const decodedTokenRef = ref<any>(null)

// Check if user has admin role
const isAdmin = computed(() => {
  return decodedTokenRef.value ? hasAdminRole(decodedTokenRef.value) : false
})

getAccessTokenSilently().then((accessToken) => {
  token = accessToken
  // Decode token and extract roles
  const decodedToken = decodeToken(accessToken)
  decodedTokenRef.value = decodedToken
  userRoles.value = extractRoles(decodedToken!)
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

// User data
const userData = reactive({
  name: user.value!.name!,
  email: user.value!.email!,
  avatar: user.value!.picture!,
})

// Navigation items as a computed property to ensure reactivity
const navMain = computed(() => {
  const baseItems = [
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
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: 'API Keys',
          url: `/organizations/${route.params.orgId}/api-keys`,
        },
      ],
    },
  ]

  // Admin section - only visible to users with Admin role
  if (isAdmin.value) {
    baseItems.push({
      title: 'Admin',
      url: '#',
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: 'Manage Nodes',
          url: `/admin/nodes`,
        },
      ],
    })
  }

  return baseItems
})

// Data object for template
const data = reactive({
  user: userData,
  navMain,
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="teams" :active-team="activeTeam" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
