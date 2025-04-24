import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import HomeView from '@/views/HomeView.vue'
import Callback from '@/views/Callback.vue'
import Organizations from '@/views/Organizations.vue'
import AppLayout from '@/layouts/App.vue'
import Instances from '@/views/Instances.vue'
import ApiKeys from '@/views/ApiKeys.vue'

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
  ],
})

export default router
