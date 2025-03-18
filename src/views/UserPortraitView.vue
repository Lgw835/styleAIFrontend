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
      <!-- 基本信息 -->
      <div class="portrait-card">
        <h3 class="card-title">基本信息</h3>
        <div class="data-list">
          <div class="data-row" v-if="portraitData.gender">
            <div class="data-label">性别</div>
            <div class="data-value-inline">{{ portraitData.gender === 'male' ? '男' : '女' }}</div>
          </div>
          <div class="data-row" v-if="portraitData.age">
            <div class="data-label">年龄</div>
            <div class="data-value-inline">{{ portraitData.age }}岁</div>
          </div>
        </div>
        <div v-if="!portraitData.gender && !portraitData.age" class="empty-data">暂无基本信息</div>
      </div>
      
      <!-- 身材数据 -->
      <div class="portrait-card">
        <h3 class="card-title">身材数据</h3>
        <div class="body-data-grid">
          <div class="data-item">
            <div class="data-value">{{ portraitData.height || '未设置' }}{{ portraitData.height ? 'cm' : '' }}</div>
            <div class="data-label">身高</div>
          </div>
          <div class="data-item">
            <div class="data-value">{{ portraitData.weight || '未设置' }}{{ portraitData.weight ? 'kg' : '' }}</div>
            <div class="data-label">体重</div>
          </div>
          <div class="data-item">
            <div class="data-value">{{ portraitData.bodyType || '未设置' }}</div>
            <div class="data-label">体型</div>
          </div>
        </div>
        
        <div v-if="portraitData.bodyShape" class="data-row">
          <div class="data-label">体形</div>
          <div class="data-value-inline">{{ portraitData.bodyShape }}</div>
        </div>
      </div>

      <!-- 风格偏好 -->
      <div class="portrait-card">
        <h3 class="card-title">风格偏好</h3>
        <div v-if="portraitData.stylePreference" class="tags-container">
          <span class="tag">{{ portraitData.stylePreference }}</span>
        </div>
        <div v-else class="empty-data">暂无风格偏好设置</div>
      </div>

      <!-- 外观特征 -->
      <div class="portrait-card">
        <h3 class="card-title">外观特征</h3>
        <div class="data-list">
          <div class="data-row" v-if="portraitData.skinTone">
            <div class="data-label">肤色</div>
            <div class="data-value-inline">{{ portraitData.skinTone }}</div>
          </div>
          <div class="data-row" v-if="portraitData.hairColor">
            <div class="data-label">发色</div>
            <div class="data-value-inline">{{ portraitData.hairColor }}</div>
          </div>
          <div class="data-row" v-if="portraitData.hairLength">
            <div class="data-label">发长</div>
            <div class="data-value-inline">{{ portraitData.hairLength }}</div>
          </div>
          <div class="data-row" v-if="portraitData.hairStyle">
            <div class="data-label">发型</div>
            <div class="data-value-inline">{{ portraitData.hairStyle }}</div>
          </div>
          <div class="data-row" v-if="portraitData.eyeColor">
            <div class="data-label">眼睛颜色</div>
            <div class="data-value-inline">{{ portraitData.eyeColor }}</div>
          </div>
          <div class="data-row" v-if="portraitData.faceShape">
            <div class="data-label">脸型</div>
            <div class="data-value-inline">{{ portraitData.faceShape }}</div>
          </div>
        </div>
        <div v-if="!hasAppearanceFeatures" class="empty-data">暂无外观特征设置</div>
      </div>

      <!-- 其他特征 -->
      <div class="portrait-card">
        <h3 class="card-title">其他特征</h3>
        <div class="data-list">
          <div class="data-row" v-if="portraitData.tattooDescription">
            <div class="data-label">纹身</div>
            <div class="data-value-inline">{{ portraitData.tattooDescription }}</div>
          </div>
          <div class="data-row" v-if="portraitData.piercingDescription">
            <div class="data-label">穿孔</div>
            <div class="data-value-inline">{{ portraitData.piercingDescription }}</div>
          </div>
          <div class="data-row" v-if="portraitData.otherFeatures">
            <div class="data-label">其他</div>
            <div class="data-value-inline">{{ portraitData.otherFeatures }}</div>
          </div>
        </div>
        <div v-if="!hasOtherFeatures" class="empty-data">暂无其他特征设置</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)

// 严格按照后端数据结构定义
const portraitData = ref({
  profileId: '',
  userId: '',
  gender: '',
  age: 0,
  height: 0,
  weight: 0,
  bodyShape: '',
  stylePreference: '',
  skinTone: '',
  hairColor: '',
  hairLength: '',
  hairStyle: '',
  eyeColor: '',
  faceShape: '',
  bodyType: '',
  tattooDescription: '',
  piercingDescription: '',
  otherFeatures: ''
})

// 计算外观特征是否存在
const hasAppearanceFeatures = computed(() => {
  return !!(
    portraitData.value.skinTone || 
    portraitData.value.hairColor || 
    portraitData.value.hairLength || 
    portraitData.value.hairStyle ||
    portraitData.value.eyeColor ||
    portraitData.value.faceShape
  )
})

// 计算其他特征是否存在
const hasOtherFeatures = computed(() => {
  return !!(
    portraitData.value.tattooDescription || 
    portraitData.value.piercingDescription || 
    portraitData.value.otherFeatures
  )
})

// 加载用户画像
onMounted(async () => {
  try {
    // 从用户存储中获取用户画像
    if (userStore.userProfile) {
      let profileData = userStore.userProfile
      
      // 处理字符串形式的用户画像
      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData)
        } catch (e) {
          console.error('解析用户画像失败:', e)
        }
      }
      
      // 填充所有字段
      portraitData.value = {
        profileId: profileData.profileId || '',
        userId: profileData.userId || '',
        gender: profileData.gender || '',
        age: profileData.age || 0,
        height: profileData.height || 0,
        weight: profileData.weight || 0,
        bodyShape: profileData.bodyShape || '',
        stylePreference: profileData.stylePreference || '',
        skinTone: profileData.skinTone || '',
        hairColor: profileData.hairColor || '',
        hairLength: profileData.hairLength || '',
        hairStyle: profileData.hairStyle || '',
        eyeColor: profileData.eyeColor || '',
        faceShape: profileData.faceShape || '',
        bodyType: profileData.bodyType || '',
        tattooDescription: profileData.tattooDescription || '',
        piercingDescription: profileData.piercingDescription || '',
        otherFeatures: profileData.otherFeatures || ''
      }
    }
  } catch (error) {
    console.error('加载用户画像失败:', error)
  } finally {
    loading.value = false
  }
})

// 前往编辑页面
const handleEdit = () => {
  router.push('/edit-portrait')
}
</script>

<style scoped>
.user-portrait {
  min-height: 100vh;
  background-color: #F7F7F7;
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
  margin-bottom: 16px;
}

.data-item {
  text-align: center;
}

.data-value {
  font-size: 18px;
  color: #333333;
}

.data-value-inline {
  font-size: 16px;
  color: #333333;
  display: inline-block;
  margin-left: 8px;
}

.data-label {
  font-size: 14px;
  color: #999999;
  margin-top: 4px;
  display: inline-block;
}

/* 数据列表 */
.data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-row {
  display: flex;
  align-items: center;
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

/* 空数据提示 */
.empty-data {
  color: #999;
  font-size: 14px;
  padding: 8px 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 