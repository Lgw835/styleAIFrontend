<template>
  <div class="user-portrait">
    <!-- 使用通用子页面导航栏组件 -->
    <SubPageNavBar title="用户画像" back-link="/profile">
      <template #right-action>
        <button class="edit-btn" @click="handleEdit">编辑</button>
      </template>
    </SubPageNavBar>

    <!-- 加载中提示 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 画像内容 -->
    <div v-else class="portrait-content">
      <!-- 身材数据 -->
      <div class="portrait-card">
        <h3 class="card-title">身材数据</h3>
        <div class="body-data-grid">
          <div class="data-item">
            <div class="data-value">{{ portraitData.height }}cm</div>
            <div class="data-label">身高</div>
          </div>
          <div class="data-item">
            <div class="data-value">{{ portraitData.weight }}kg</div>
            <div class="data-label">体重</div>
          </div>
          <div class="data-item">
            <div class="data-value">{{ portraitData.size }}码</div>
            <div class="data-label">尺码</div>
          </div>
        </div>
      </div>

      <!-- 风格偏好 -->
      <div class="portrait-card">
        <h3 class="card-title">风格偏好</h3>
        <div class="tags-container">
          <span v-for="(tag, index) in portraitData.stylePreferences" :key="'style-'+index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 场景偏好 -->
      <div class="portrait-card">
        <h3 class="card-title">场景偏好</h3>
        <div class="tags-container">
          <span v-for="(tag, index) in portraitData.scenePreferences" :key="'scene-'+index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 颜色偏好 -->
      <div class="portrait-card">
        <h3 class="card-title">颜色偏好</h3>
        <div class="tags-container">
          <span v-for="(tag, index) in portraitData.colorPreferences" :key="'color-'+index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 肤色 -->
      <div class="portrait-card">
        <h3 class="card-title">肤色</h3>
        <div class="tags-container">
          <span class="tag">{{ portraitData.skinTone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userPortraitService from '@/services/userPortraitService'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const router = useRouter()
const loading = ref(true)
const portraitData = ref({
  height: 0,
  weight: 0,
  size: '',
  stylePreferences: [],
  scenePreferences: [],
  colorPreferences: [],
  skinTone: ''
})

// 获取用户画像数据
onMounted(async () => {
  try {
    loading.value = true
    const data = await userPortraitService.getUserPortrait()
    portraitData.value = data
  } catch (error) {
    console.error('获取用户画像失败:', error)
  } finally {
    loading.value = false
  }
})

// 处理编辑按钮点击
const handleEdit = () => {
  router.push('/edit-portrait')
}
</script>

<style scoped>
.user-portrait {
  min-height: 100vh;
  background-color: #F7F7F7;
  padding-bottom: 24px;
}

/* 内容区域 */
.portrait-content {
  padding-top: 56px; /* 顶部导航栏高度 */
  padding-bottom: 24px;
}

.portrait-card {
  background-color: #FFFFFF;
  padding: 16px 24px;
  margin-bottom: 12px;
}

.card-title {
  color: #333333;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

/* 身材数据网格 */
.body-data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.data-item {
  text-align: center;
}

.data-value {
  font-size: 18px;
  color: #333333;
}

.data-label {
  font-size: 14px;
  color: #999999;
  margin-top: 4px;
}

/* 标签样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  background: rgba(64, 150, 255, 0.1);
  color: #4096FF;
}

/* 编辑按钮 */
.edit-btn {
  color: #4096FF;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

/* 加载指示器 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #F7F7F7;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(64, 150, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4096FF;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: #666666;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 