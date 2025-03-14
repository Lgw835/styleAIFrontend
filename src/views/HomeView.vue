<template>
  <div class="home">
    <!-- 使用导航栏组件 -->
    <TopNavBar title="智能穿搭" />
    
    <!-- 主要内容区 -->
    <div class="content">
      <!-- 天气卡片 -->
      <div class="weather-card">
        <div class="weather-info">
          <div>
            <h3>北京</h3>
            <p>晴朗 • 空气优</p>
          </div>
          <div class="temperature">
            <p class="current-temp">23°</p>
            <p class="temp-range">15° / 26°</p>
          </div>
        </div>
      </div>

      <!-- 今日幸运色 -->
      <div class="lucky-color">
        <h3>今日幸运色</h3>
        <div class="color-display">
          <div class="color-circle"></div>
          <div class="color-info">
            <p>浅粉红色</p>
            <p>带来好运与温暖</p>
          </div>
        </div>
      </div>

      <!-- 功能网格 -->
      <div class="feature-grid">
        <router-link to="/daily-match" class="feature-item">
          <div class="icon-wrapper blue">
            <i class="fas fa-tshirt"></i>
          </div>
          <h3>每日一搭</h3>
          <p>AI为您精选搭配</p>
        </router-link>
        <router-link to="/dress-recommend" class="feature-item">
          <div class="icon-wrapper purple">
            <i class="fas fa-magic"></i>
          </div>
          <h3>穿搭推荐</h3>
          <p>个性化搭配建议</p>
        </router-link>
        <div class="feature-item">
          <router-link to="/ai-review" class="block">
            <div class="icon-wrapper green">
              <i class="fas fa-star"></i>
            </div>
            <h3>AI评价</h3>
            <p>专业搭配点评</p>
          </router-link>
        </div>
        <div class="feature-item">
          <router-link to="/outfit-record" class="block">
            <div class="icon-wrapper yellow">
              <i class="fas fa-history"></i>
            </div>
            <h3>穿搭记录</h3>
            <p>查看历史搭配</p>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 用户画像构建询问弹窗 -->
    <van-dialog
      v-model:show="showProfileBuildDialog"
      title="完善您的个人信息"
      confirm-button-text="立即构建"
      cancel-button-text="稍后再说"
      @confirm="handleBuildProfile"
      @cancel="handleSkipProfileBuild"
    >
      <div class="p-4">
        <p>为了给您提供更精准的穿搭推荐，我们需要了解您的身材特征和穿搭偏好。</p>
        <p class="mt-2 text-sm text-gray-500">这将帮助我们为您提供更个性化的服务。</p>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

export default {
  name: 'HomeView',
  components: {
    TopNavBar
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const showProfileBuildDialog = ref(false)

    onMounted(() => {
      // 如果是新注册用户，显示用户画像构建询问
      if (userStore.isNewUser) {
        showProfileBuildDialog.value = true
      }
    })

    // 处理用户选择构建用户画像
    const handleBuildProfile = () => {
      // 导航到用户画像构建页面
      router.push('/build-profile')
    }

    // 用户选择稍后再说
    const handleSkipProfileBuild = () => {
      showProfileBuildDialog.value = false
      // 可能需要在这里设置一个标志，避免重复提示
    }

    return {
      showProfileBuildDialog,
      handleBuildProfile,
      handleSkipProfileBuild
    }
  }
}
</script>

<style scoped>
.home {
  padding-top: 56px;
}

.content {
  padding: 16px;
  max-height: calc(100vh - 56px);
  overflow-y: auto;
  box-sizing: border-box;
}

.weather-card, .lucky-color {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.weather-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.current-temp {
  font-size: 2rem;
  font-weight: 300;
}

.temp-range {
  color: #6b7280;
  font-size: 0.875rem;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.color-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #FFB6C1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.icon-wrapper.blue { background-color: #e0f2fe; }
.icon-wrapper.purple { background-color: #f3e8ff; }
.icon-wrapper.green { background-color: #dcfce7; }
.icon-wrapper.yellow { background-color: #fef9c3; }

.feature-item h3 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.feature-item p {
  font-size: 0.875rem;
  color: #6b7280;
}
</style> 