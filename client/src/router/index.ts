import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import HomeView from '@/views/HomeView.vue'
import Callback from '@/views/Callback.vue'
import Organizations from '@/views/Organizations.vue'
import AppLayout from '@/layouts/App.vue'
import Instances from '@/views/Instances.vue'
import ApiKeys from '@/views/ApiKeys.vue'
import AdminNodes from '@/views/AdminNodes.vue'
import NodeZones from '@/views/NodeZones.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { decodeToken, hasAdminRole } from '@/lib/auth'

// Admin guard to check if user has Admin role
const adminGuard = () => {
  return async (to: any, from: any, next: any) => {
    const { getAccessTokenSilently } = useAuth0()

    try {
      // Get the access token
      const accessToken = await getAccessTokenSilently()

      // Decode the token and check for admin role
      const decodedToken = decodeToken(accessToken)

      if (hasAdminRole(decodedToken)) {
        next()
      } else {
        // Redirect to home if not admin
        next({ name: 'home' })
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      next({ name: 'home' })
    }
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Organizations,
      beforeEnter: authGuard,
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback,
    },
    {
      path: '/organizations',
      name: 'organizations',
      component: Organizations,
      beforeEnter: authGuard,
    },
    {
      path: '/organizations/:orgId',
      name: 'orgDetails',
      meta: { layout: AppLayout },
      component: HomeView,
      beforeEnter: authGuard,
    },
    {
      path: '/organizations/:orgId/instances',
      name: 'orgInstances',
      meta: { layout: AppLayout },
      component: Instances,
      beforeEnter: authGuard,
    },
    {
      path: '/organizations/:orgId/api-keys',
      name: 'orgApiKeys',
      meta: { layout: AppLayout },
      component: ApiKeys,
      beforeEnter: authGuard,
    },
    // Admin routes
    {
      path: '/admin/nodes',
      name: 'adminNodes',
      meta: { layout: AppLayout },
      component: AdminNodes,
      beforeEnter: [authGuard, adminGuard()],
    },
    {
      path: '/admin/nodes/:nodeId/zones',
      name: 'nodeZones',
      meta: { layout: AppLayout },
      component: NodeZones,
      beforeEnter: [authGuard, adminGuard()],
    },
  ],
})

export default router
