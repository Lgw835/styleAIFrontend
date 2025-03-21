<template>
  <div class="animated-bg min-h-screen flex flex-col">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="每日一搭" 
      backLink="/"
      class="nav-transparent"
    />

    <!-- 加载状态指示器 -->
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="bg-white/20 backdrop-blur-lg p-6 rounded-xl flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-white">获取穿搭推荐中...</p>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="flex-1 flex items-center justify-center px-6 relative">
      <!-- 粒子效果 -->
      <div class="particles" id="particles"></div>
      
      <!-- 浮动彩词 -->
      <div v-if="!animationStarted" class="floating-words">
        <div 
          v-for="(word, index) in floatingWords" 
          :key="index"
          class="floating-word"
          :class="word.class"
          :style="{ 
            left: word.x + '%', 
            top: word.y + '%',
            animationDelay: (index * 0.3) + 's',
            fontSize: word.size + 'rem'
          }"
          ref="wordElements"
        >
          {{ word.text }}
        </div>
      </div>
      
      <!-- 中心内容 -->
      <div class="text-center z-10">
        <div class="mb-10 floating">
          <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
            <i class="fas fa-tshirt text-white text-5xl"></i>
          </div>
          <h2 class="text-3xl font-bold text-white mb-3">开启你的专属穿搭之旅</h2>
          <p class="text-white/80">AI智能推荐，为你打造完美造型</p>
          
          <!-- 用户画像完整度 -->
          <div v-if="userStore.userProfile" class="mt-3 flex items-center justify-center">
            <div class="profile-completeness bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
              <div class="flex items-center">
                <span class="text-white text-sm mr-2">画像完整度</span>
                <div class="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div class="bg-white h-full rounded-full" :style="{ width: profileCompleteness + '%' }"></div>
                </div>
                <span class="text-white text-sm ml-2">{{ profileCompleteness }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          @click="handleButtonClick" 
          class="glow-button inline-block bg-white/20 backdrop-blur-md text-white px-12 py-5 rounded-full text-xl font-medium shadow-lg transform transition hover:scale-105 active:scale-95"
          ref="matchButton"
        >
          <i class="fas fa-magic mr-2"></i>
          开始每日一搭
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { useOutfitResultStore } from '@/stores/outfitResult'
import { useScheduleStore } from '@/stores/schedule'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { dayRecommend } from '@/api/outfit'
import { storeToRefs } from 'pinia'

export default {
  name: 'DailyMatchView',
  components: {
    SubPageNavBar
  },
  setup() {
    const userStore = useUserStore()
    const externalDataStore = useExternalDataStore()
    const outfitResultStore = useOutfitResultStore()
    const scheduleStore = useScheduleStore()
    const router = useRouter()
    
    // 使用 storeToRefs 确保响应式
    const { dailyLuckyColor } = storeToRefs(externalDataStore)
    
    // 加载状态
    const loading = ref(false)
    
    // 浮动词元素引用
    const wordElements = ref([])
    const matchButton = ref(null)
    
    // 动画状态
    const animationStarted = ref(false)
    
    // 计算用户画像完整度
    const calculateProfileCompleteness = () => {
      const profileStr = userStore.userProfile
      if (!profileStr) return 0
      
      try {
        const profile = typeof profileStr === 'string' 
          ? JSON.parse(profileStr) 
          : profileStr
          
        // 排除 ID 字段，计算所有其他字段
        const validFields = [
          'gender', 'age', 'height', 'weight', 'bodyShape', 
          'stylePreference', 'skinTone', 'hairColor', 'hairLength', 
          'hairStyle', 'eyeColor', 'faceShape', 'bodyType',
          'tattooDescription', 'piercingDescription', 'otherFeatures'
        ]
        
        let filledFields = 0
        let totalFields = validFields.length
        
        for (const field of validFields) {
          if (profile[field] !== undefined) {
            // 数字类型：值不为0算作已填写
            if (typeof profile[field] === 'number' && profile[field] !== 0) {
              filledFields++
            } 
            // 字符串类型：非空字符串算作已填写
            else if (typeof profile[field] === 'string' && profile[field].trim() !== '') {
              filledFields++
            }
            // 数组类型：长度大于0算作已填写
            else if (Array.isArray(profile[field]) && profile[field].length > 0) {
              filledFields++
            }
          }
        }
        
        return Math.round((filledFields / totalFields) * 100)
      } catch (error) {
        console.error('计算用户画像完整度失败:', error)
        return 0
      }
    }
    
    // 计算用户画像完整度
    const profileCompleteness = computed(() => calculateProfileCompleteness())
    
    // 浮动词数据
    const floatingWords = [
      { text: "行程", x: 25, y: 30, size: 1.5, class: "text-yellow-300" },
      { text: "天气", x: 70, y: 45, size: 2, class: "text-blue-300" },
      { text: "心情", x: 20, y: 65, size: 1.8, class: "text-pink-300" },
      { text: "幸运色", x: 75, y: 25, size: 1.6, class: "text-purple-300" },
      { text: "形象", x: 35, y: 75, size: 2.2, class: "text-green-300" },
      { text: "风格", x: 65, y: 60, size: 1.7, class: "text-red-300" }
    ]
    
    // 获取幸运色
    const getLuckyColor = () => {
      // 从全局 externalDataStore 中获取每日幸运色
      return dailyLuckyColor.value?.name || '薄荷绿'
    }
    
    // 整合日程信息成字符串
    const getScheduleString = () => {
      if (!scheduleStore.todaySchedules || scheduleStore.todaySchedules.length === 0) {
        return ""
      }
      
      // 整合今日日程信息，结合描述和备注
      return scheduleStore.todaySchedules
        .map(schedule => {
          let eventText = schedule.eventDescribe || '';
          // 如果有备注信息，添加到事件描述后
          if (schedule.notes && schedule.notes.trim()) {
            eventText += `(${schedule.notes})`;
          }
          return eventText;
        })
        .filter(text => text) // 过滤掉空字符串
        .join("，");
    }
    
    // 获取用户画像信息
    const getUserProfileString = () => {
      if (!userStore.userProfile) return ""
      
      try {
        // 尝试解析用户画像
        const profileObj = typeof userStore.userProfile === 'string' 
          ? JSON.parse(userStore.userProfile) 
          : userStore.userProfile
        
        // 构建用户画像信息字符串
        const profileInfo = []
        
        // 定义要获取的有效字段
        const validFields = [
          { key: 'gender', label: '性别', transform: (val) => val === 'male' ? '男' : val === 'female' ? '女' : val },
          { key: 'age', label: '年龄', transform: (val) => val + '岁' },
          { key: 'height', label: '身高', transform: (val) => val + 'cm' },
          { key: 'weight', label: '体重', transform: (val) => val + 'kg' },
          { key: 'bodyShape', label: '体型' },
          { key: 'stylePreference', label: '风格偏好' },
          { key: 'skinTone', label: '肤色' },
          { key: 'hairColor', label: '发色' },
          { key: 'hairLength', label: '发长' },
          { key: 'hairStyle', label: '发型' },
          { key: 'eyeColor', label: '眼睛颜色' },
          { key: 'faceShape', label: '脸型' },
          { key: 'tattooDescription', label: '纹身描述' },
          { key: 'piercingDescription', label: '穿孔描述' },
          { key: 'otherFeatures', label: '其他特征' }
        ]
        
        // 遍历字段并添加非空值
        validFields.forEach(field => {
          const value = profileObj[field.key]
          if (value !== undefined && value !== null) {
            // 数字类型：值不为0才添加
            if (typeof value === 'number' && value !== 0) {
              profileInfo.push(`我的${field.label}: ${field.transform ? field.transform(value) : value}`)
            } 
            // 字符串类型：非空字符串才添加
            else if (typeof value === 'string' && value.trim() !== '') {
              profileInfo.push(`我的${field.label}: ${field.transform ? field.transform(value) : value}`)
            }
          }
        })
        
        return profileInfo.join("\n")
      } catch (e) {
        console.error('解析用户画像失败:', e)
        return ""
      }
    }
    
    // 处理按钮点击 - 先执行动画，再调用API
    const handleButtonClick = () => {
      if (loading.value || animationStarted.value) return
      
      animationStarted.value = true
      
      // 获取按钮位置
      const buttonRect = matchButton.value.getBoundingClientRect()
      const buttonCenterX = buttonRect.left + buttonRect.width / 2
      const buttonCenterY = buttonRect.top + buttonRect.height / 2
      
      // 执行彩词飞向按钮的动画
      wordElements.value.forEach((wordEl, index) => {
        if (!wordEl) return
        
        const wordRect = wordEl.getBoundingClientRect()
        const wordCenterX = wordRect.left + wordRect.width / 2
        const wordCenterY = wordRect.top + wordRect.height / 2
        
        const translateX = buttonCenterX - wordCenterX
        const translateY = buttonCenterY - wordCenterY
        
        // 设置动画
        wordEl.style.transition = `transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s, opacity 0.8s ease ${index * 0.1}s`
        wordEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.5)`
        wordEl.style.opacity = '0'
      })
      
      // 动画结束后调用API
      setTimeout(() => {
        startMatching()
      }, 1200) // 给足够时间让动画完成
    }
    
    // 开始匹配
    const startMatching = async () => {
      if (loading.value) return
      
      loading.value = true
      
      try {
        // 准备请求参数
        const requestData = {
          userId: userStore.userInfo?.userId || "",
          ipAddress: externalDataStore.locationData?.city ? 
            `${externalDataStore.locationData.province || ''} ${externalDataStore.locationData.city}` : "",
          weather: externalDataStore.weatherData?.text ? 
            `${externalDataStore.weatherData.text} ${externalDataStore.weatherData.temp}°C` : "",
          luckyColor: getLuckyColor(),
          schedule: getScheduleString(),
          scene: "日常场景", // 每日一搭默认日常场景
          features: "日常风格", // 每日一搭默认日常风格
          additionalInfo: getUserProfileString()
        }
        
        console.log('发送每日一搭请求:', requestData)
        
        // 调用API
        const response = await dayRecommend(requestData)
        
        // 检查返回的数据格式
        if (!response || typeof response !== 'object') {
          throw new Error('API返回数据格式不正确')
        }
        
        if (!response.readablePlan) {
          console.warn('API返回数据中没有readablePlan字段')
        }
        
        // 构建完整的数据对象，与DressRecommendView保持一致
        const storeData = {
          ...response,
          sceneId: "每日一搭", // 使用"每日一搭"作为场景标识
          highlightTags: dailyLuckyColor.value?.name || "幸运色" // 使用幸运色作为标签
        }
        
        console.log('准备存储到store的数据:', storeData)
        
        // 保存到store
        outfitResultStore.setInitialRecommendation(storeData)
        
        // 跳转到结果页面
        router.push('/outfit-result')
        
      } catch (error) {
        console.error('生成每日一搭失败:', error)
        // 重置动画状态，允许重新点击
        animationStarted.value = false
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      createParticles()
    })
    
    // 创建粒子效果
    const createParticles = () => {
      const container = document.getElementById('particles')
      if (!container) return
      
      const particleCount = 50
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animationDelay = Math.random() * 20 + 's'
        container.appendChild(particle)
      }
    }
    
    return {
      loading,
      startMatching,
      floatingWords,
      wordElements,
      matchButton,
      animationStarted,
      handleButtonClick,
      dailyLuckyColor,
      profileCompleteness,
      userStore
    }
  }
}
</script>

<style scoped>
/* 透明导航栏样式 */
:deep(.sub-nav) {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: none;
}

:deep(.nav-title) {
  color: white;
}

:deep(.back-button) {
  color: white;
}

:deep(.back-button:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 炫酷背景动画 */
.animated-bg {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  height: 100vh;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 按钮发光和脉冲效果 */
.glow-button {
  position: relative;
  overflow: hidden;
  transition: all 0.5s;
  z-index: 1;
}

.glow-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  transform: rotate(45deg);
  animation: pulse 2s infinite;
  z-index: -1;
}

.glow-button::after {
  content: '';
  position: absolute;
  inset: -5px;
  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
  background-size: 400%;
  z-index: -2;
  filter: blur(10px);
  animation: glowing 20s linear infinite;
  opacity: 0;
  transition: opacity .3s;
  border-radius: 9999px;
}

.glow-button:hover::after {
  opacity: 1;
}

@keyframes pulse {
  0% { transform: scale(0.8) rotate(45deg); opacity: 0.8; }
  50% { transform: scale(1) rotate(45deg); opacity: 1; }
  100% { transform: scale(0.8) rotate(45deg); opacity: 0.8; }
}

@keyframes glowing {
  0% { background-position: 0 0; }
  50% { background-position: 400% 0; }
  100% { background-position: 0 0; }
}

/* 漂浮元素动画 */
.floating {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0% { transform: translate(0, 0px); }
  50% { transform: translate(0, 15px); }
  100% { transform: translate(0, 0px); }
}

/* 粒子效果 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: particleFloat 20s infinite linear;
}

@keyframes particleFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; }
}

/* 浮动彩词样式 */
.floating-words {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-word {
  position: absolute;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  animation: wordFloat 6s ease-in-out infinite;
  opacity: 0.9;
  transform-origin: center center;
  will-change: transform;
}

@keyframes wordFloat {
  0% { transform: translate(0, 0) rotate(-5deg); }
  25% { transform: translate(-10px, 10px) rotate(0deg); }
  50% { transform: translate(0, -5px) rotate(5deg); }
  75% { transform: translate(10px, 10px) rotate(0deg); }
  100% { transform: translate(0, 0) rotate(-5deg); }
}

.text-yellow-300 { color: #fcd34d; }
.text-blue-300 { color: #93c5fd; }
.text-pink-300 { color: #f9a8d4; }
.text-purple-300 { color: #c4b5fd; }
.text-green-300 { color: #86efac; }
.text-red-300 { color: #fca5a5; }
</style> 