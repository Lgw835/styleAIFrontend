<template>
  <div class="min-h-screen bg-gray-50">
    <van-nav-bar
      title="智能穿搭"
      fixed
      placeholder
      safe-area-inset-top
      class="bg-white border-b border-gray-100"
      :style="{ height: '46px' }"
    >
      <template #right>
        <div @click="showScheduleNotification" class="mr-4 relative">
          <i class="fas fa-bell text-lg text-gray-600"></i>
          <span v-if="shouldShowNotificationDot" 
                class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full">
          </span>
        </div>
      </template>
    </van-nav-bar>
    
    <div class="px-4" :style="{ paddingTop: '56px', paddingBottom: '70px' }">
      <div class="flex flex-col gap-3">
        <div 
          class="rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md" 
          :class="weatherClass"
        >
          <div class="p-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-medium mb-1">{{ weatherData.city }}</h3>
                <div class="flex items-center">
                  <i :class="weatherIcon" class="text-2xl mr-2"></i>
                  <p>{{ weatherData.text }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-4xl font-light">{{ weatherData.temp }}°</p>
                <p class="text-sm mt-1 opacity-85">{{ weatherData.tempMin }}° / {{ weatherData.tempMax }}°</p>
              </div>
            </div>
          </div>
        </div>

        <div 
          class="rounded-xl overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md"
          :style="getLuckyColorStyle"
        >
          <div class="p-4">
            <div class="flex items-center">
              <div 
                class="w-12 h-12 rounded-full shadow-sm mr-4 border border-white/20" 
                :style="{ backgroundColor: dailyLuckyColor.hex }"
              ></div>
              <div>
                <h4 class="text-lg font-medium mb-1">今日幸运色: {{ dailyLuckyColor.name }}</h4>
                <p class="text-sm opacity-85 line-clamp-2">{{ dailyLuckyColor.suggestion }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="clothingSuggestion" 
           class="mt-3 bg-white rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md flex items-center">
        <i class="fas fa-tshirt text-xl text-blue-500 mr-4"></i>
        <span class="text-gray-700">{{ clothingSuggestion }}</span>
      </div>

      <h3 class="text-xl font-medium mt-6 mb-3 px-1">智能穿搭功能</h3>
      
      <div class="grid grid-cols-2 gap-3">
        <router-link to="/daily-match" 
                     class="bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
          <div class="flex justify-center items-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white mx-auto mb-3">
            <i class="fas fa-tshirt text-xl"></i>
          </div>
          <h3 class="text-lg font-medium mb-1">每日一搭</h3>
          <p class="text-sm text-gray-500">AI为您精选搭配</p>
        </router-link>
        
        <router-link to="/dress-recommend" class="bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
          <div class="flex justify-center items-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 text-white mx-auto mb-3">
            <i class="fas fa-magic text-xl"></i>
          </div>
          <h3 class="text-lg font-medium mb-1">穿搭推荐</h3>
          <p class="text-sm text-gray-500">个性化搭配建议</p>
        </router-link>
        
        <router-link to="/ai-review" class="bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
          <div class="flex justify-center items-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 text-white mx-auto mb-3">
            <i class="fas fa-star text-xl"></i>
          </div>
          <h3 class="text-lg font-medium mb-1">AI评价</h3>
          <p class="text-sm text-gray-500">专业搭配点评</p>
        </router-link>
        
        <router-link to="/outfit-records" class="bg-white rounded-xl p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
          <div class="flex justify-center items-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white mx-auto mb-3">
            <i class="fas fa-history text-xl"></i>
          </div>
          <h3 class="text-lg font-medium mb-1">穿搭记录</h3>
          <p class="text-sm text-gray-500">查看历史搭配</p>
        </router-link>
      </div>
    </div>

    <UserProfileOverlay
      :show="showProfileOverlay"
      @close="closeProfileOverlay"
      @save="handleProfileSaved"
      @skip="skipProfileSetup"
    />

    <van-dialog
      v-model:show="showNotificationDialog"
      title="今日日程提醒"
      @confirm="viewScheduleDetails"
      @cancel="closeNotification"
      confirm-button-text="查看详情"
      cancel-button-text="知道了"
      :close-on-click-overlay="true"
      @click-overlay="closeNotification"
    >
      <div class="py-4 text-center">
        <i class="fas fa-calendar-check text-4xl text-green-500 mb-4"></i>
        <p class="text-gray-700">
          今天您有 <span class="text-blue-500 font-semibold">{{ scheduleStore.todaySchedules.length }}</span> 个日程安排
          <template v-if="scheduleStore.importantCount > 0">
            ，其中 <span class="text-red-500 font-semibold">{{ scheduleStore.importantCount }}</span> 个重要日程
          </template>
        </p>
      </div>
    </van-dialog>

    <div v-if="needsProfileSetup" 
         class="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 w-64 border border-blue-200">
      <div class="flex items-center mb-2">
        <i class="fas fa-user-circle text-blue-500 text-2xl mr-2"></i>
        <h3 class="font-semibold text-gray-800">完善个人信息</h3>
      </div>
      <p class="text-sm text-gray-600 mb-4">完善您的个人信息，获取更精准的穿搭推荐！</p>
      <div class="flex justify-between">
        <button @click="showProfileOverlay = true" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
          立即填写
        </button>
        <button @click="dismissProfileReminder" 
                class="text-gray-500 text-sm">
          稍后再说
        </button>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div class="flex justify-around py-2">
        <router-link to="/" class="flex flex-col items-center text-blue-500">
          <i class="fas fa-home text-xl mb-1"></i>
          <span class="text-xs">首页</span>
        </router-link>
        <router-link to="/wardrobe" class="flex flex-col items-center text-gray-600">
          <i class="fas fa-tshirt text-xl mb-1"></i>
          <span class="text-xs">衣柜</span>
        </router-link>
        <router-link to="/plaza" class="flex flex-col items-center text-gray-600">
          <i class="fas fa-compass text-xl mb-1"></i>
          <span class="text-xs">广场</span>
        </router-link>
        <router-link to="/profile" class="flex flex-col items-center text-gray-600">
          <i class="fas fa-user text-xl mb-1"></i>
          <span class="text-xs">我的</span>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script>
import { onMounted, ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useScheduleStore } from '@/stores/schedule'
import UserProfileOverlay from '@/components/UserProfileOverlay.vue'
import { getWeather, saveWeatherRecord } from '@/api/weather'

export default {
  name: 'HomeView',
  components: {
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
      
      if (text.includes('晴')) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      if (text.includes('多云')) return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
      if (text.includes('阴')) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      if (text.includes('雨')) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      if (text.includes('雪')) return 'bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800';
      
      return '';
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

    // 使用 ref 来跟踪访问状态
    const isFirstVisit = ref(sessionStorage.getItem('isFirstVisit') === 'true')

    // 监听 isFirstVisit 的变化
    watch(isFirstVisit, (newValue) => {
      sessionStorage.setItem('isFirstVisit', newValue.toString())
    })

    // 修改红点显示逻辑
    const shouldShowNotificationDot = computed(() => {
      const hasSchedules = scheduleStore.todaySchedules && scheduleStore.todaySchedules.length > 0
      return isFirstVisit.value && hasSchedules
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

    // 修改显示日程提醒对话框的方法
    const showScheduleNotification = () => {
      if (scheduleStore.todaySchedules && scheduleStore.todaySchedules.length > 0) {
        showNotificationDialog.value = true
        // 直接修改 ref 值，这会触发 watch
        isFirstVisit.value = false
      }
    }

    onMounted(async () => {
      // 获取天气数据
      await fetchWeather()
      // 获取幸运色
      fetchLuckyColor()
      // 检查日程
      checkSchedules()
      
      // 保存天气记录 - 明确在天气数据加载完成后调用
      if (weatherData.value && weatherData.value.city && weatherData.value.city !== '正在定位...') {
        saveWeatherData()
      }
      
      // 检查是否需要显示用户画像填写蒙版
      checkProfileNeeded()

      // 在HomeView的创建时，检查登录状态
      const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
      if (!isLoggedIn) {
        console.log('HomeView检测到未登录状态，重定向到登录页')
        router.replace('/login')
      } else {
        console.log('HomeView确认已登录状态')
      }

      // 如果已登录，获取日程
      if (userStore.isLoggedIn) {
        await scheduleStore.fetchTodaySchedules(userStore.userInfo.userId)
        console.log('Mounted: 日程获取完成', scheduleStore.todaySchedules) // 调试用
      }
    })

    // 检查是否需要显示用户画像填写蒙版
    const checkProfileNeeded = () => {
      if (userStore && userStore.isLoggedIn && !userStore.userProfile) {
        const isNewLogin = sessionStorage.getItem('newLogin') === 'true'
        if (isNewLogin) {
          showProfileOverlay.value = true
          sessionStorage.removeItem('newLogin')
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
      sessionStorage.setItem('profileReminderDismissed', Date.now().toString())
    }

    const showNotificationDialog = ref(false)
    const showScheduleDetailDialog = ref(false)
    
    // 查看日程详情
    function viewScheduleDetails() {
      showNotificationDialog.value = false
      scheduleStore.setTodayNotificationViewed(true)
      
      // 导航到日程页面
      router.push('/schedule')
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
      sessionStorage.setItem('profileReminderDismissed', Date.now().toString())
    }

    // 检查是否应该显示提醒
    const shouldShowProfileReminder = () => {
      if (userStore && userStore.isLoggedIn && !userStore.userProfile) {
        // 检查是否之前关闭过提醒
        const dismissedTime = sessionStorage.getItem('profileReminderDismissed')
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

    // 保存天气记录
    async function saveWeatherData() {
      if (!userStore.isLoggedIn || !weatherData.value || !weatherData.value.city) {
        console.log('用户未登录或天气数据不完整，不记录天气信息')
        return
      }
      
      try {
        const weatherRecord = {
          userId: userStore.userInfo.userId,
          location: weatherData.value.city,
          temperature: weatherData.value.temp.toString(),
          weatherType: weatherData.value.text,
          date: new Date().toISOString()
        }
        
        console.log('保存天气记录:', weatherRecord)
        
        // 调用API保存天气记录
        const result = await saveWeatherRecord(weatherRecord)
        console.log('天气记录保存结果:', result)
      } catch (error) {
        console.error('保存天气记录失败:', error)
      }
    }

    // 修改fetchWeather方法，确保数据获取后保存天气记录
    const fetchWeather = async () => {
      try {
        // 获取天气数据并等待完成
        await externalDataStore.fetchWeatherData()
        console.log('天气数据已更新:', weatherData.value)
        
        // 在天气数据更新后立即保存记录
        if (userStore.isLoggedIn && weatherData.value && weatherData.value.city) {
          saveWeatherData() 
        }
      } catch (error) {
        console.error('获取天气数据失败:', error)
      }
    }

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
      router,
      saveWeatherData,
      isFirstVisit
    }
  }
}
</script>

<style>
/* 添加一些过渡效果 */
.transition-all {
  transition: all 0.3s ease;
}

/* 确保渐变效果平滑 */
.bg-gradient-to-r,
.bg-gradient-to-br {
  background-size: 200% 200%;
}

/* 铃铛图标容器 */
.relative {
  position: relative;
  display: inline-block;
}

/* 红点样式 */
.absolute {
  position: absolute;
}

/* 可以添加动画效果 */
.bg-red-500 {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 