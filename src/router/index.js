import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlazaView from '../views/PlazaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/wardrobe',
      name: 'wardrobe',
      component: () => import('../views/WardrobeView.vue')
    },
    {
      path: '/plaza',
      name: 'plaza',
      component: PlazaView
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    }
  ]
})

export default router 