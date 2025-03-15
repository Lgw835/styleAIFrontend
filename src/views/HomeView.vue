<template>
  <div class="home">
    <!-- 使用导航栏组件 -->
    <TopNavBar title="智能穿搭">
      <!-- 在导航栏右侧添加日程提醒图标 -->
      <template #right>
        <div class="schedule-bell" @click="showScheduleNotification">
          <van-badge dot v-if="shouldShowNotificationDot">
            <i class="fas fa-bell"></i>
          </van-badge>
          <i class="fas fa-bell" v-else></i>
        </div>
      </template>
    </TopNavBar>
    
    <!-- 主要内容区 -->
    <div class="content">
      <!-- 顶部信息区：天气和幸运色组合 -->
      <div class="info-panel">
        <!-- 天气卡片 -->
        <div class="weather-card" :class="weatherClass">
          <div class="weather-info">
            <div>
              <h3>{{ weatherData.city }}</h3>
              <div class="weather-description">
                <i :class="weatherIcon"></i>
                <p>{{ weatherData.text }}</p>
              </div>
            </div>
            <div class="temperature">
              <p class="current-temp">{{ weatherData.temp }}°</p>
              <p class="temp-range">{{ weatherData.tempMin }}° / {{ weatherData.tempMax }}°</p>
            </div>
          </div>
        </div>
        
        <!-- 今日幸运色 - 带背景色的原始布局 -->
        <div class="lucky-color-card" :style="getLuckyColorStyle">
          <div class="lucky-color-simple">
            <div class="color-circle" :style="{ backgroundColor: dailyLuckyColor.hex }"></div>
            <div class="lucky-color-text">
              <h4>今日幸运色: {{ dailyLuckyColor.name }}</h4>
              <p>{{ dailyLuckyColor.suggestion }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 穿衣建议 -->
      <div class="clothing-suggestion" v-if="clothingSuggestion">
        <i class="fas fa-tshirt"></i>
        <span>{{ clothingSuggestion }}</span>
      </div>

      <!-- 功能网格 - 增强样式 -->
      <h3 class="section-title">智能穿搭功能</h3>
      <div class="feature-grid">
        <router-link to="/daily-match" class="feature-item">
          <div class="feature-icon-wrapper blue">
            <i class="fas fa-tshirt"></i>
          </div>
          <div class="feature-content">
            <h3>每日一搭</h3>
            <p>AI为您精选搭配</p>
          </div>
        </router-link>
        
        <router-link to="/dress-recommend" class="feature-item">
          <div class="feature-icon-wrapper purple">
            <i class="fas fa-magic"></i>
          </div>
          <div class="feature-content">
            <h3>穿搭推荐</h3>
            <p>个性化搭配建议</p>
          </div>
        </router-link>
        
        <router-link to="/ai-review" class="feature-item">
          <div class="feature-icon-wrapper green">
            <i class="fas fa-star"></i>
          </div>
          <div class="feature-content">
            <h3>AI评价</h3>
            <p>专业搭配点评</p>
          </div>
        </router-link>
        
        <router-link to="/outfit-records" class="feature-item">
          <div class="feature-icon-wrapper yellow">
            <i class="fas fa-history"></i>
          </div>
          <div class="feature-content">
            <h3>穿搭记录</h3>
            <p>查看历史搭配</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- 用户画像填写蒙版 -->
    <UserProfileOverlay
      :show="showProfileOverlay"
      @close="closeProfileOverlay"
      @save="handleProfileSaved"
      @skip="skipProfileSetup"
    />

    <!-- 修改为轻量级提示框 -->
    <van-dialog
      v-model:show="showNotificationDialog"
      title="今日日程提醒"
      @confirm="viewScheduleDetails"
      @cancel="closeNotification"
      confirmButtonText="查看详情"
      cancelButtonText="知道了"
    >
      <div class="notification-content">
        <i class="fas fa-calendar-check notification-icon"></i>
        <p>
          今天您有 <span class="highlight">{{ scheduleStore.todaySchedules.length }}</span> 个日程安排
          <template v-if="scheduleStore.importantCount > 0">
            ，其中 <span class="highlight important">{{ scheduleStore.importantCount }}</span> 个重要日程
          </template>
          。
        </p>
      </div>
    </van-dialog>

    <!-- 添加用户画像提醒，仅当用户已登录但没有画像时显示 -->
    <div v-if="needsProfileSetup" 
         class="fixed bottom-5 right-5 bg-white rounded-lg shadow-lg p-3 z-50 w-64 border border-blue-200">
      <div class="flex items-center mb-2">
        <i class="fas fa-user-circle text-blue-500 text-xl mr-2"></i>
        <h3 class="font-medium text-gray-800">完善个人信息</h3>
      </div>
      <p class="text-sm text-gray-600 mb-3">完善您的个人信息，获取更精准的穿搭推荐！</p>
      <div class="flex justify-between">
        <button @click="showProfileOverlay = true" 
                class="bg-blue-500 text-white px-3 py-1 rounded-md text-sm">
          立即填写
        </button>
        <button @click="dismissProfileReminder" 
                class="text-gray-500 text-sm underline">
          稍后再说
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useScheduleStore } from '@/stores/schedule'
import UserProfileOverlay from '@/components/UserProfileOverlay.vue'

export default {
  name: 'HomeView',
  components: {
    TopNavBar,
    UserProfileOverlay
  },
  setup() {
    const userStore = useUserStore()
    const externalDataStore = useExternalDataStore()
    const router = useRouter()
    const showProfileOverlay = ref(false)
    const scheduleStore = useScheduleStore()
    
    // 使用 storeToRefs 确保响应式
    const { weatherData, loading } = storeToRefs(externalDataStore)

    // 根据天气状况计算图标
    const weatherIcon = computed(() => {
      const text = weatherData.value.text || '';
      
      if (text.includes('晴') && text.includes('云')) return 'fas fa-cloud-sun';
      if (text.includes('晴')) return 'fas fa-sun';
      if (text.includes('多云')) return 'fas fa-cloud-sun';
      if (text.includes('阴')) return 'fas fa-cloud';
      if (text.includes('雷')) return 'fas fa-bolt';
      if (text.includes('雨') && text.includes('雪')) return 'fas fa-cloud-meatball';
      if (text.includes('雪')) return 'fas fa-snowflake';
      if (text.includes('雨') && text.includes('大')) return 'fas fa-cloud-showers-heavy';
      if (text.includes('雨')) return 'fas fa-cloud-rain';
      if (text.includes('雾') || text.includes('霾')) return 'fas fa-smog';
      if (text.includes('风') || text.includes('飑')) return 'fas fa-wind';
      
      // 默认图标
      return 'fas fa-cloud';
    });
    
    // 根据天气状况计算CSS类
    const weatherClass = computed(() => {
      const text = weatherData.value.text || '';
      const temp = parseInt(weatherData.value.temp || 0);
      
      let weatherType = 'default';
      
      if (text.includes('晴') && !text.includes('云')) weatherType = 'sunny';
      else if (text.includes('雨')) weatherType = 'rainy';
      else if (text.includes('雪')) weatherType = 'snowy';
      else if (text.includes('雾') || text.includes('霾')) weatherType = 'foggy';
      else if (text.includes('云') || text.includes('阴')) weatherType = 'cloudy';
      
      // 温度等级
      let tempClass = 'mild';
      if (temp >= 30) tempClass = 'hot';
      else if (temp >= 20) tempClass = 'warm';
      else if (temp <= 5) tempClass = 'cold';
      else if (temp <= 10) tempClass = 'cool';
      
      return `weather-${weatherType} temp-${tempClass}`;
    });
    
    // 根据天气计算穿衣建议
    const clothingSuggestion = computed(() => {
      const temp = parseInt(weatherData.value.temp || 0);
      const text = weatherData.value.text || '';
      
      if (temp >= 30) return '建议穿着轻薄、透气的衣物，注意防晒';
      if (temp >= 25) return '适合穿短袖、短裤等清凉衣物';
      if (temp >= 20) return '适合穿短袖或薄长袖衬衫';
      if (temp >= 15) return '建议穿长袖衬衫、薄外套';
      if (temp >= 10) return '建议穿长袖衬衫、毛衣和外套';
      if (temp >= 5) return '建议穿毛衣、外套和薄羽绒服';
      if (temp >= 0) return '建议穿厚外套、羽绒服等保暖衣物';
      return '建议穿羽绒服、厚棉服等多层保暖衣物';
    });
    
    // 每日幸运色
    const luckyColors = [
      {
        name: '浅粉红',
        hex: '#FFB6C1',
        description: '象征温柔与甜美，能带来好运与温暖',
        traits: ['温柔', '浪漫', '亲和力'],
        suggestion: '今天适合在穿搭中加入粉色元素，会给人留下温柔甜美的印象'
      },
      {
        name: '薄荷绿',
        hex: '#98FB98',
        description: '清新自然，代表新的开始与活力',
        traits: ['清新', '活力', '自然'],
        suggestion: '今天穿搭可以融入薄荷绿元素，给人清爽自然的感觉'
      },
      {
        name: '宝石蓝',
        hex: '#4682B4',
        description: '稳重与智慧的象征，带来安定与自信',
        traits: ['智慧', '沉稳', '专业'],
        suggestion: '今天适合以蓝色为主色调，展现专业稳重的形象'
      },
      {
        name: '珊瑚橙',
        hex: '#FF7F50',
        description: '充满活力与创造力，带来积极情绪',
        traits: ['活力', '热情', '创意'],
        suggestion: '在今天的穿搭中点缀橙色元素，会让你更有活力和亲和力'
      },
      {
        name: '柔和紫',
        hex: '#D8BFD8',
        description: '神秘浪漫，象征独特与优雅',
        traits: ['优雅', '浪漫', '神秘'],
        suggestion: '今天适合在搭配中加入紫色元素，展现独特品味'
      },
      {
        name: '温暖黄',
        hex: '#FFD700',
        description: '阳光活力，象征乐观与希望',
        traits: ['乐观', '活力', '阳光'],
        suggestion: '今天在穿搭中融入黄色，会让你更有朝气和感染力'
      },
      {
        name: '沉稳棕',
        hex: '#8B4513',
        description: '代表稳重与踏实，给人可靠感',
        traits: ['稳重', '可靠', '成熟'],
        suggestion: '今天适合选择棕色系穿搭，展现沉稳大气的风格'
      }
    ];
    
    // 根据日期计算每日幸运色
    const dailyLuckyColor = computed(() => {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      return luckyColors[dayOfYear % luckyColors.length];
    });

    onMounted(async () => {
      // 检查天气数据是否存在且未过期（30分钟内）
      const now = new Date()
      const lastUpdate = weatherData.value.lastUpdated ? new Date(weatherData.value.lastUpdated) : null
      const needUpdate = !lastUpdate || (now - lastUpdate) > 30 * 60 * 1000 // 30分钟更新一次

      if (needUpdate) {
        // 获取天气数据并等待完成
        await externalDataStore.fetchWeatherData()
        console.log('天气数据已更新:', weatherData.value)
      } else {
        console.log('使用缓存的天气数据:', weatherData.value)
      }

      // 如果用户已登录，获取今日日程
      if (userStore.isLoggedIn && userStore.userInfo?.userId) {
        // 检查是否需要更新日程数据（一小时更新一次）
        const now = new Date()
        const lastUpdate = scheduleStore.lastUpdated ? new Date(scheduleStore.lastUpdated) : null
        const needUpdate = !lastUpdate || (now - lastUpdate) > 60 * 60 * 1000 // 一小时更新一次

        if (needUpdate) {
          // 使用真实API
          await scheduleStore.fetchTodaySchedules(userStore.userInfo.userId)
          
          // 记录当前天气
          if (weatherData.value && weatherData.value.city !== '正在定位...') {
            // 使用真实API记录天气
            await scheduleStore.recordWeather({
              userId: userStore.userInfo.userId,
              location: weatherData.value.city,
              temperature: weatherData.value.temp,
              weatherType: weatherData.value.text,
              date: new Date().toISOString()
            })
          }
        }
      }

      // 检查是否需要显示用户画像填写蒙版
      checkProfileNeeded()
    })

    // 检查是否需要显示用户画像填写蒙版
    const checkProfileNeeded = () => {
      if (userStore && userStore.isLoggedIn && !userStore.userProfile) {
        const isNewLogin = localStorage.getItem('newLogin') === 'true'
        if (isNewLogin) {
          showProfileOverlay.value = true
          localStorage.removeItem('newLogin')
        }
      }
    }
    
    // 关闭蒙版
    const closeProfileOverlay = () => {
      showProfileOverlay.value = false
    }
    
    // 处理保存成功
    const handleProfileSaved = (data) => {
      showProfileOverlay.value = false
      // 可以添加其他逻辑，比如显示祝贺信息等
    }
    
    // 跳过用户画像设置
    const skipProfileSetup = () => {
      showProfileOverlay.value = false
      // 设置一个标记，24小时内不再显示
      localStorage.setItem('profileReminderDismissed', Date.now().toString())
    }

    const showNotificationDialog = ref(false)
    const showScheduleDetailDialog = ref(false)
    
    // 决定是否显示提醒红点
    const shouldShowNotificationDot = computed(() => {
      return scheduleStore.todaySchedules.length > 0 && !scheduleStore.todayNotificationViewed
    })
    
    // 格式化时间
    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // 显示日程通知
    function showScheduleNotification() {
      if (scheduleStore.todaySchedules.length > 0) {
        showNotificationDialog.value = true
      } else {
        // 如果没有日程，直接显示空状态
        showScheduleDetailDialog.value = true
      }
    }
    
    // 查看日程详情
    function viewScheduleDetails() {
      showNotificationDialog.value = false
      scheduleStore.markNotificationAsViewed()
      
      // 简单导航到日程页面
      router.push('/schedule')
      console.log('查看日程详情按钮点击')
    }
    
    // 关闭通知
    function closeNotification() {
      showNotificationDialog.value = false
      scheduleStore.markNotificationAsViewed()
    }

    // 计算幸运色卡片的样式
    const getLuckyColorStyle = computed(() => {
      const color = dailyLuckyColor.value.hex || '#FFFFFF';
      return {
        background: `linear-gradient(135deg, ${color}10, ${color}20)`,
        borderLeft: `3px solid ${color}`,
        color: '#333'
      };
    })

    // 是否显示用户画像提醒
    const showProfileReminder = ref(true)

    // 关闭提醒
    const dismissProfileReminder = () => {
      showProfileReminder.value = false
      // 可以设置一个临时的状态，避免频繁提醒用户
      localStorage.setItem('profileReminderDismissed', Date.now().toString())
    }

    // 检查是否应该显示提醒
    const shouldShowProfileReminder = () => {
      if (userStore && userStore.isLoggedIn && !userStore.userProfile) {
        // 检查是否之前关闭过提醒
        const dismissedTime = localStorage.getItem('profileReminderDismissed')
        if (dismissedTime) {
          // 如果24小时内关闭过，则不再显示
          const hoursPassed = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60)
          return hoursPassed > 24
        }
        return true
      }
      return false
    }

    // 添加一个计算属性安全访问 userStore
    const needsProfileSetup = computed(() => {
      return userStore && userStore.isLoggedIn && !userStore.userProfile
    })

    return {
      weatherData,
      loading,
      weatherIcon,
      weatherClass,
      clothingSuggestion,
      dailyLuckyColor,
      showProfileOverlay,
      closeProfileOverlay,
      handleProfileSaved,
      skipProfileSetup,
      showNotificationDialog,
      shouldShowNotificationDot,
      scheduleStore,
      formatTime,
      formatDate,
      showScheduleNotification,
      viewScheduleDetails,
      closeNotification,
      showScheduleDetailDialog,
      getLuckyColorStyle,
      showProfileReminder,
      dismissProfileReminder,
      shouldShowProfileReminder,
      needsProfileSetup,
      userStore,
      router
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

/* 信息面板 - 组合天气和幸运色 */
.info-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.weather-card {
  flex: 1;
  min-width: 180px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 0;
}

.lucky-color-card {
  flex: 1;
  min-width: 180px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

/* 恢复原有布局样式 */
.lucky-color-simple {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lucky-color-simple .color-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.lucky-color-text {
  flex: 1;
}

.lucky-color-text h4 {
  font-size: 1rem;
  margin-bottom: 4px;
  font-weight: 600;
}

.lucky-color-text p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 穿衣建议 */
.clothing-suggestion {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.clothing-suggestion i {
  color: #666;
  font-size: 1.1rem;
}

/* 功能板块样式增强 */
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-item {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.feature-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.feature-icon-wrapper i {
  font-size: 1.3rem;
  color: #333;
}

.feature-content {
  flex: 1;
  position: relative;
}

.feature-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.feature-content p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.feature-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.feature-icon-wrapper.blue { 
  background-color: #e0f2fe; 
}

.feature-icon-wrapper.purple { 
  background-color: #f3e8ff; 
}

.feature-icon-wrapper.green { 
  background-color: #dcfce7; 
}

.feature-icon-wrapper.yellow { 
  background-color: #fef9c3; 
}

/* 保留其他已有的天气相关样式 */
.weather-sunny {
  background: linear-gradient(135deg, #ffd86f, #fc6262);
  color: white;
}

.weather-cloudy {
  background: linear-gradient(135deg, #c9d6ff, #e2e2e2);
}

/* 其他天气样式... */

.weather-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.weather-description {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.weather-description i {
  font-size: 1.2rem;
}

.current-temp {
  font-size: 2.2rem;
  font-weight: 300;
  line-height: 1;
}

.temp-range {
  opacity: 0.8;
  font-size: 0.9rem;
  text-align: right;
}

/* 提醒铃铛图标样式 */
.schedule-bell {
  padding: 0 16px;
  cursor: pointer;
}

.schedule-bell i {
  font-size: 1.2rem;
  color: #333;
}

/* 通知内容样式 */
.notification-content {
  padding: 16px;
  text-align: center;
}

.notification-icon {
  font-size: 2.5rem;
  color: #4CAF50;
  margin-bottom: 16px;
}

.notification-content p {
  font-size: 1.1rem;
  line-height: 1.5;
}

.highlight {
  font-weight: bold;
  color: #2196F3;
}

.highlight.important {
  color: #F44336;
}

/* 日程列表样式 */
.schedule-list {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.schedule-item.important {
  background-color: #fff8f8;
}

.schedule-time {
  font-size: 0.9rem;
  color: #666;
  min-width: 80px;
}

.schedule-content {
  flex: 1;
  margin: 0 12px;
}

.schedule-content h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.schedule-content p {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #666;
}

.schedule-item i {
  color: #ff9800;
  font-size: 1rem;
}

.empty-schedule {
  text-align: center;
  padding: 32px 16px;
  color: #999;
}

.empty-schedule i {
  font-size: 2rem;
  margin-bottom: 8px;
}

.empty-schedule p {
  margin: 0;
}
</style> 