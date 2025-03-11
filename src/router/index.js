import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlazaView from '../views/PlazaView.vue'
import DailyMatchView from '../views/DailyMatchView.vue'
import DressRecommendView from '../views/DressRecommendView.vue'
import AIReviewView from '../views/AIReviewView.vue'
import OutfitRecordView from '../views/OutfitRecordView.vue'

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
    },
    {
      path: '/daily-match',
      name: 'daily-match',
      component: DailyMatchView
    },
    {
      path: '/dress-recommend',
      name: 'dress-recommend',
      component: DressRecommendView
    },
    {
      path: '/ai-review',
      name: 'ai-review',
      component: AIReviewView
    },
    {
      path: '/outfit-record',
      name: 'outfit-record',
      component: OutfitRecordView
    }
  ]
})

export default router 