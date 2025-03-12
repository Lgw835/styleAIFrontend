import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlazaView from '../views/PlazaView.vue'
import DailyMatchView from '../views/DailyMatchView.vue'
import DressRecommendView from '../views/DressRecommendView.vue'
import AIReviewView from '../views/AIReviewView.vue'
import OutfitRecordView from '../views/OutfitRecordView.vue'
import UploadOutfitView from '../views/UploadOutfitView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
      path: '/wardrobe/:id',
      name: 'clothing-detail',
      component: () => import('../views/ClothingDetailView.vue')
    },
    {
      path: '/wardrobe/upload',
      name: 'wardrobe-upload',
      component: () => import('../views/WardrobeUploadView.vue')
    },
    {
      path: '/virtual-fitting',
      name: 'virtual-fitting',
      component: () => import('../views/VirtualFittingView.vue')
    },
    {
      path: '/fitting-history',
      name: 'fitting-history',
      component: () => import('../views/FittingHistoryView.vue')
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
    },
    {
      path: '/outfit-result',
      name: 'outfit-result',
      component: () => import('@/views/OutfitResultView.vue')
    },
    {
      path: '/upload-outfit',
      name: 'upload-outfit',
      component: UploadOutfitView
    }
  ]
})

export default router 