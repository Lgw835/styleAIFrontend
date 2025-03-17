import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlazaView from '../views/PlazaView.vue'
import DailyMatchView from '../views/DailyMatchView.vue'
import DressRecommendView from '../views/DressRecommendView.vue'
import AIReviewView from '../views/AIReviewView.vue'
import OutfitRecordView from '../views/OutfitRecordView.vue'
import UploadOutfitView from '../views/UploadOutfitView.vue'
import LoginView from '../views/LoginView.vue'
import PhoneLoginView from '../views/PhoneLoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import FittingHistoryView from '../views/FittingHistoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/phone-login',
      name: 'phone-login',
      component: PhoneLoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
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
      path: '/edit-profile',
      name: 'edit-profile',
      component: () => import('../views/EditProfileView.vue')
    },
    {
      path: '/user-portrait',
      name: 'user-portrait',
      component: () => import('../views/UserPortraitView.vue')
    },
    {
      path: '/edit-portrait',
      name: 'edit-portrait',
      component: () => import('../views/EditPortraitView.vue')
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/ChangePasswordView.vue')
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
      redirect: '/outfit-records'
    },
    {
      path: '/outfit-records',
      name: 'OutfitRecords',
      component: OutfitRecordView,
      meta: { requiresAuth: true }
    },
    {
      path: '/outfit-result',
      name: 'outfit-result',
      component: () => import('@/views/OutfitResultView.vue'),
      meta: {
        title: '穿搭详情',
        requiresAuth: true
      }
    },
    {
      path: '/upload-outfit',
      name: 'upload-outfit',
      component: UploadOutfitView
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('@/views/ScheduleView.vue')
    },
    {
      path: '/schedule-detail/:id',
      name: 'schedule-detail',
      component: () => import('@/views/ScheduleDetailView.vue')
    },
    {
      path: '/schedule-edit',
      name: 'schedule-add',
      component: () => import('@/views/ScheduleEditView.vue')
    },
    {
      path: '/schedule-edit/:id',
      name: 'schedule-edit',
      component: () => import('@/views/ScheduleEditView.vue')
    },
    {
      path: '/help-center',
      name: 'help-center',
      component: () => import('@/views/HelpCenterView.vue')
    },
    {
      path: '/contact-service',
      name: 'contact-service',
      component: () => import('@/views/ContactServiceView.vue')
    },
    {
      path: '/user-profile',
      name: 'user-profile',
      redirect: '/profile'
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 使用sessionStorage检查登录状态
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
  console.log('路由守卫检查:', { to: to.path, from: from.path, isLoggedIn })
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    console.log('需要认证，重定向到登录页')
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    if (isLoggedIn && to.path === '/login') {
      console.log('已登录用户访问登录页，重定向到首页')
      next({ path: '/home' })
    } else {
      console.log('正常导航到:', to.path)
      next()
    }
  }
})

export default router 