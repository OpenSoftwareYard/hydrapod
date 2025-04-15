<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChevronsUpDown, Plus } from 'lucide-vue-next'

import { type Component, ref } from 'vue'
import { useRoute } from 'vue-router'
import CreateOrganizationDialog from '@/components/CreateOrganizationDialog.vue'

type Team = {
  id: string
  name: string
  logo: Component
  plan: string
}

const props = defineProps<{
  teams: Team[]
  activeTeam?: Team
}>()

const activeTeam = ref({})
const isDialogOpen = ref(false)

const { isMobile } = useSidebar()

function onOrganizationCreated(org: any) {
  // Handle the newly created organization
  // This could involve refreshing the teams list or adding the new org to the list
  console.log('New organization created:', org)

  // You might want to emit an event to the parent component
  // to handle the new organization
}
</script>

<template>
  <div>
    <!-- Dialog placed outside of dropdown structure -->
    <CreateOrganizationDialog
      v-model:open="isDialogOpen"
      :show-trigger="false"
      @organization-created="onOrganizationCreated"
    />

    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <component :is="props.activeTeam?.logo" class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">
                  {{ props.activeTeam?.name }}
                </span>
                <span class="truncate text-xs">{{ props.activeTeam?.plan }}</span>
              </div>
              <ChevronsUpDown class="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            :side="isMobile ? 'bottom' : 'right'"
            :side-offset="4"
          >
            <DropdownMenuLabel class="text-xs text-muted-foreground"> Teams </DropdownMenuLabel>
            <DropdownMenuItem
              v-for="(team, index) in teams"
              :key="team.name"
              class="gap-2 p-2"
              @click="activeTeam = team"
            >
              <div class="flex size-6 items-center justify-center rounded-sm border">
                <component :is="team.logo" class="size-4 shrink-0" />
              </div>
              {{ team.name }}
              <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <!-- Only the trigger is inside the dropdown -->
            <DropdownMenuItem class="gap-2 p-2" @click="isDialogOpen = true">
              <div class="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus class="size-4" />
              </div>
              <div class="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </div>
</template>
