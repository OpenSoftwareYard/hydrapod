import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { authGuard } from '@auth0/auth0-vue'
import Callback from '@/views/Callback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: async (to) => {
        const auth = await authGuard(to)
      },
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback,
    },
  ],
})

export default router
