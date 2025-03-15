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
      
      <!-- 中心内容 -->
      <div class="text-center z-10">
        <div class="mb-10 floating">
          <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
            <i class="fas fa-tshirt text-white text-5xl"></i>
          </div>
          <h2 class="text-3xl font-bold text-white mb-3">开启你的专属穿搭之旅</h2>
          <p class="text-white/80">AI智能推荐，为你打造完美造型</p>
        </div>
        
        <button @click="startMatching" class="glow-button inline-block bg-white/20 backdrop-blur-md text-white px-12 py-5 rounded-full text-xl font-medium shadow-lg transform transition hover:scale-105 active:scale-95">
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
import { ref } from 'vue'
import { showToast } from 'vant'

export default {
  name: 'DailyMatchView',
  components: {
    SubPageNavBar
  },
  setup() {
    const userStore = useUserStore()
    const externalDataStore = useExternalDataStore()
    const outfitResultStore = useOutfitResultStore()
    
    // 加载状态
    const loading = ref(false)
    
    return {
      userStore,
      externalDataStore,
      outfitResultStore,
      loading
    }
  },
  mounted() {
    this.createParticles();
    this.checkDailyMatch();
  },
  methods: {
    createParticles() {
      const container = document.getElementById('particles');
      const particleCount = 50;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        container.appendChild(particle);
      }
    },
    // 检查是否已有每日一搭推荐
    async checkDailyMatch() {
      if (!this.userStore.isLoggedIn) {
        return; // 用户未登录，不检查
      }
      
      this.loading = true;
      
      try {
        // TODO: 实际调用后端API检查每日一搭
        // const response = await getDailyMatch(this.userStore.userInfo.id)
        // if (response && response.data && response.data.outfitDescription) {
        //   // 有每日一搭数据，设置到store中
        //   this.outfitResultStore.setInitialRecommendation(response.data)
        //   // 直接跳转到结果页面
        //   this.$router.push('/outfit-result')
        //   return
        // }
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟随机返回结果 (20%概率有推荐)
        const hasRecommendation = Math.random() < 0.2
        
        if (hasRecommendation) {
          // 模拟已有推荐的情况
          const mockResponse = {
            readablePlan: `## 今日穿搭\n\n### 上装\n淡蓝色衬衫，搭配米色针织开衫。\n\n### 下装\n深灰色直筒休闲裤，简约舒适。\n\n### 鞋子配饰\n棕色皮鞋，搭配简约腕表。\n\n### 搭配提示\n- 今日天气适宜，建议薄外套随身携带\n- 整体色调沉稳大方，适合多种场合\n- 今日幸运色：米色，已融入穿搭`,
            imagePrompt: `well-dressed person in light blue shirt, beige cardigan, dark grey pants, brown leather shoes, minimal accessories, neutral background, natural lighting, fashion photography`,
            summary: '今日穿搭：清爽自然的商务休闲风格'
          }
          
          // 设置到store
          this.outfitResultStore.setInitialRecommendation(mockResponse)
          
          // 跳转到结果页面
          this.$router.push('/outfit-result')
        }
        
      } catch (error) {
        console.error('检查每日一搭失败', error)
      } finally {
        this.loading = false
      }
    },
    async startMatching() {
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        // 准备用户ID
        const userId = this.userStore.userInfo?.id || '';
        
        // 获取天气数据
        let weatherInfo = '';
        if (this.externalDataStore.weatherData?.text) {
          weatherInfo = `${this.externalDataStore.weatherData.text} ${this.externalDataStore.weatherData.temp}°C`;
        }
        
        // 生成幸运色（模拟）
        const luckyColors = ['红色', '蓝色', '绿色', '黄色', '紫色', '橙色', '粉色', '青色'];
        const luckyColor = luckyColors[Math.floor(Math.random() * luckyColors.length)];
        
        // 模拟日程信息
        const schedule = '上午会议，下午工作，晚上朋友聚餐';
        
        // 准备请求参数 - 严格按照API文档 OutfitRecommendRequestVO 结构
        const requestData = {
          userId: userId,
          ipAddress: this.externalDataStore.locationData?.city || '未知位置',
          weather: weatherInfo,
          luckyColor: luckyColor,
          schedule: schedule,
          scene: '', // 每日一搭不指定场景
          features: '', // 每日一搭不指定特征
          additionalInfo: '每日一搭自动推荐'
        };
        
        // TODO: 实际API调用
        // const response = await getOutfitRecommend(requestData)
        // if (response && response.data) {
        //   this.outfitResultStore.setInitialRecommendation(response.data)
        //   this.$router.push('/outfit-result')
        //   return
        // }
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 模拟API响应 - 符合 OutfitRecommendResponseVO 结构
        const mockResponse = {
          readablePlan: `## 今日穿搭\n\n### 上装\n米色高领毛衣，搭配深棕色休闲西装外套。\n\n### 下装\n深蓝色修身牛仔裤，简约百搭。\n\n### 鞋子配饰\n棕色皮鞋或休闲皮靴，搭配简约手表。\n\n### 搭配提示\n- 今日天气${weatherInfo ? weatherInfo : '温和'}，适合这套穿搭\n- 今日日程包含：${schedule}，这套穿搭既正式又不失休闲\n- 今日幸运色：${luckyColor}，建议随身携带${luckyColor}饰品或配件\n- 整体风格沉稳大气，适合全天各种场合`,
          imagePrompt: `fashion model wearing beige turtleneck sweater, dark brown casual blazer, navy blue slim jeans, brown leather shoes, simple watch, neutral background, natural lighting, ${userId ? 'personalized' : 'general'} outfit, 4k quality fashion photography`,
          summary: `今日推荐：融合幸运色${luckyColor}的商务休闲风格，适合全天各类场合`
        };
        
        // 设置到store中
        this.outfitResultStore.setInitialRecommendation(mockResponse);
        
        // 显示成功提示
        showToast('每日穿搭已生成');
        
        // 跳转到结果页面
        this.$router.push('/outfit-result');
        
      } catch (error) {
        console.error('生成每日一搭失败', error);
        showToast('生成失败，请重试');
      } finally {
        this.loading = false;
      }
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
</style> 