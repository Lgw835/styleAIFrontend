<template>
  <div class="profile">
    <TopNavBar title="我的" />
    <div class="profile-container">
      <!-- 添加一个内容容器 -->
      <div class="content-wrapper">
        <!-- 用户信息卡片 -->
        <div class="user-card">
          <div class="user-info">
            <div class="avatar-container">
              <div class="avatar">
                <img 
                  :src="userStore.userInfo?.imagePath || 'https://i.pravatar.cc/80?img=5'" 
                  :alt="userStore.userInfo?.username || '时尚达人'"
                  class="avatar-image"
                >
                <button class="camera-btn" @click="goToEditProfile">
                  <i class="fas fa-camera"></i>
                </button>
              </div>
            </div>
            <div class="user-stats">
              <h1 class="username">{{ userStore.userInfo?.username || '时尚达人' }}</h1>
              <div class="stats-grid">
                <router-link to="/followers" class="stat-item">
                  <p class="stat-value">0</p>
                  <p class="stat-label">关注</p>
                </router-link>
                <router-link to="/fans" class="stat-item">
                  <p class="stat-value">0</p>
                  <p class="stat-label">粉丝</p>
                </router-link>
                <div class="stat-item">
                  <p class="stat-value">0</p>
                  <p class="stat-label">获赞</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能区 -->
        <div class="features-container">
          <!-- 基本信息设置 -->
          <div class="card">
            <h2 class="card-title">基本信息</h2>
            <ul class="menu-list">
              <li v-for="(item, index) in basicMenuItems" :key="index">
                <router-link :to="item.route" class="menu-item">
                  <div class="content">
                    <i :class="item.icon"></i>
                    <span class="label">{{ item.label }}</span>
                    <span class="description">{{ item.description }}</span>
                  </div>
                  <i class="fas fa-chevron-right arrow"></i>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 其他功能 -->
          <div class="card">
            <ul class="menu-list">
              <li v-for="(item, index) in otherMenuItems" :key="index">
                <router-link :to="item.route" class="menu-item">
                  <div class="content">
                    <i :class="item.icon"></i>
                    <span class="label">{{ item.label }}</span>
                    <span v-if="item.description" class="description">{{ item.description }}</span>
                  </div>
                  <i class="fas fa-chevron-right arrow"></i>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 退出登录按钮 -->
          <button class="logout-btn" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>
    </div>
    
    <!-- 添加底部导航栏 -->
    <div class="bottom-nav">
      <router-link to="/" class="nav-item">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/wardrobe" class="nav-item">
        <i class="fas fa-tshirt"></i>
        <span>衣柜</span>
      </router-link>
      <router-link to="/plaza" class="nav-item">
        <i class="fas fa-compass"></i>
        <span>广场</span>
      </router-link>
      <router-link to="/profile" class="nav-item active">
        <i class="fas fa-user"></i>
        <span>我的</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopNavBar from '@/components/TopNavBar.vue'
// 引入所有需要清理的 store
import { useUserStore } from '@/stores/user'
import { useOutfitRecordStore } from '@/stores/outfitRecord'
import { useExternalDataStore } from '@/stores/externalData'
import { useOutfitResultStore } from '@/stores/outfitResult'
import { useOutfitStore } from '@/stores/outfitStore'
import { useScheduleStore } from '@/stores/schedule'

const router = useRouter()
// 初始化所有 store
const userStore = useUserStore()
const outfitRecordStore = useOutfitRecordStore()
const externalDataStore = useExternalDataStore()
const outfitResultStore = useOutfitResultStore()
const outfitStore = useOutfitStore()
const scheduleStore = useScheduleStore()

const basicMenuItems = ref([
  {
    icon: 'fas fa-user-circle',
    label: '个人资料',
    description: '完善个人信息',
    route: '/edit-profile'
  },
  {
    icon: 'fas fa-palette',
    label: '用户画像',
    description: '定制专属穿搭方案',
    route: '/user-portrait'
  },
  {
    icon: 'fas fa-lock',
    label: '修改密码',
    description: '验证码确认',
    route: '/change-password'
  }
])

const otherMenuItems = ref([
  {
    icon: 'fas fa-calendar-alt',
    label: '我的日程',
    description: '查看和管理日程安排',
    route: '/schedule'
  },
  {
    icon: 'fas fa-question-circle',
    label: '帮助中心',
    route: '/help-center'
  },
  {
    icon: 'fas fa-headset',
    label: '联系客服',
    route: '/contact-service'
  }
])

const handleLogout = () => {
  // 1. 清空所有 sessionStorage
  sessionStorage.clear()
  localStorage.clear() // 同时清除本地存储，以防万一
  
  console.log('已清空所有会话数据')
  
  // 2. 使用 location.href 跳转到登录页，这会触发完整的页面刷新
  // 这样所有 Pinia store 都会被重置为初始状态
  window.location.href = '/login'
}

// 添加跳转到编辑资料的方法
const goToEditProfile = () => {
  router.push('/edit-profile')
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #F7F7F7;
  padding-bottom: 60px;
}

/* 添加内容容器样式 */
.content-wrapper {
  padding-top: 56px; /* 与顶部导航栏高度相同 */
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.user-card {
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  padding: 20px 16px;
  border-radius: 0 0 24px 24px;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  padding: 0 16px;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
  overflow: hidden; /* 确保图片不会超出圆形边界 */
}

/* 添加头像图片样式 */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填充整个容器并保持比例 */
}

.camera-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5); /* 稍微调深背景色以提高可见度 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  border: none;
  cursor: pointer;
  z-index: 1; /* 确保按钮在图片上层 */
}

.camera-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.user-stats {
  flex: 1;
  margin-left: 16px;
}

.username {
  font-size: 24px;
  font-weight: 500;
  color: white;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 280px;
}

.stat-item {
  text-align: center;
  text-decoration: none;
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: 500;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.features-container {
  padding: 0 16px;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
  padding: 12px 16px;
  border-bottom: 1px solid #F3F4F6;
}

.menu-list {
  list-style: none;
}

.menu-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F3F4F6;
  text-decoration: none;
  color: inherit;
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
}

.content i {
  color: #9CA3AF;
  width: 16px;
  margin-right: 12px;
}

.label {
  font-size: 15px;
  color: #374151;
}

.description {
  font-size: 13px;
  color: #9CA3AF;
  margin-left: 12px;
}

.arrow {
  color: #D1D5DB;
  font-size: 12px;
}

.logout-btn {
  width: 100%;
  background: white;
  color: #EF4444;
  padding: 12px 0;
  border-radius: 12px;
  font-weight: 500;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.logout-btn:hover {
  background: #F9FAFB;
}

/* 底部导航栏样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-decoration: none;
  padding: 8px 0;
  width: 25%;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 0.75rem;
}

.nav-item.active {
  color: #3B82F6;
}
</style> 