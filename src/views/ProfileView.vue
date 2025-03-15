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
                <span>用户头像</span>
                <button class="camera-btn">
                  <i class="fas fa-camera"></i>
                </button>
              </div>
            </div>
            <div class="user-stats">
              <h1 class="username">时尚达人</h1>
              <div class="stats-grid">
                <router-link to="/followers" class="stat-item">
                  <p class="stat-value">128</p>
                  <p class="stat-label">关注</p>
                </router-link>
                <router-link to="/fans" class="stat-item">
                  <p class="stat-value">256</p>
                  <p class="stat-label">粉丝</p>
                </router-link>
                <div class="stat-item">
                  <p class="stat-value">1024</p>
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

          <!-- 用户资料页面可能有穿搭记录的入口 -->
          <div @click="$router.push('/outfit-records')">我的穿搭记录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopNavBar from '@/components/TopNavBar.vue'

const router = useRouter()

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
  // 实现登出逻辑
  router.push('/login')
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
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.camera-btn {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  border: none;
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
</style> 