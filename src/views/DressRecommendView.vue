<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- 顶部导航栏 -->
    <SubPageNavBar title="穿搭推荐" backLink="/" />

    <!-- 主要内容区 -->
    <div class="flex-1 pt-14 pb-4">
      <div class="p-4 space-y-4">
        <!-- 用户形象导入 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">用户画像</h3>
          <div class="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="use-profile" 
              v-model="useProfile"
              class="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              :disabled="!hasUserProfile"
            >
            <label for="use-profile" class="ml-2 text-gray-700">
              使用我的用户画像进行推荐
              <span v-if="!hasUserProfile" class="text-xs text-red-500 ml-2">(暂无画像数据)</span>
            </label>
          </div>
          <p class="text-xs text-gray-500 mb-3">系统将使用您的身材数据、风格偏好等信息，为您生成更个性化的穿搭推荐。</p>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">画像完整度</span>
            <div class="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full" :style="{ width: profileCompleteness + '%' }"></div>
            </div>
            <span class="text-sm text-blue-500">{{ profileCompleteness }}%</span>
          </div>
        </div>

        <!-- 场景选择 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">穿搭场景</h3>
          <div class="grid grid-cols-3 gap-3">
            <button 
              v-for="scene in scenes" 
              :key="scene.name"
              class="p-3 border rounded-lg text-center"
              :class="{ 'bg-blue-50 border-blue-500': selectedScene === scene.name }"
              @click="selectScene(scene.name)"
            >
              <i :class="['fas', scene.icon, 'mb-2', 'text-gray-600']"></i>
              <p class="text-sm">{{ scene.name }}</p>
            </button>
          </div>
        </div>

        <!-- 形象标签 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">形象标签</h3>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="tag in imageTags" 
              :key="tag"
              class="px-4 py-2 rounded-full border"
              :class="{ 'bg-blue-50 border-blue-500': selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- 性别选择 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">性别</h3>
          <div class="flex gap-4">
            <button 
              class="flex-1 py-2 rounded-lg border"
              :class="{ 'bg-blue-50 border-blue-500': gender === 'male' }"
              @click="selectGender('male')"
            >
              <i class="fas fa-mars mr-2"></i>男士
            </button>
            <button 
              class="flex-1 py-2 rounded-lg border"
              :class="{ 'bg-blue-50 border-blue-500': gender === 'female' }"
              @click="selectGender('female')"
            >
              <i class="fas fa-venus mr-2"></i>女士
            </button>
          </div>
        </div>

        <!-- 附加信息 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">附加信息</h3>
          <textarea 
            v-model="additionalInfo"
            class="w-full border rounded-lg p-3 h-24" 
            placeholder="请输入其他需求或偏好..."
          ></textarea>
        </div>

        <!-- 下一步按钮 -->
        <button 
          class="w-full bg-blue-500 text-white py-3 rounded-lg mt-6"
          @click="handleNext"
        >
          下一步
        </button>
      </div>
    </div>

    <!-- 添加加载状态 -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-3"></div>
        <p class="text-gray-700">{{loadingMessage}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { getOutfitRecommend } from '@/api/outfit'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { computed, onMounted, ref } from 'vue'
import { useOutfitResultStore } from '@/stores/outfitResult'

export default {
  name: 'DressRecommendView',
  components: {
    SubPageNavBar
  },
  setup() {
    // 获取用户信息
    const userStore = useUserStore()
    // 获取位置数据
    const externalDataStore = useExternalDataStore()
    // 位置加载状态
    const isLocationLoading = ref(false)
    
    // 初始化位置数据
    onMounted(async () => {
      if (!externalDataStore.locationData.city) {
        isLocationLoading.value = true
        try {
          await externalDataStore.getLocationData()
        } catch (error) {
          console.error('获取位置信息失败', error)
        } finally {
          isLocationLoading.value = false
        }
      }
    })
    
    // 计算用户画像完整度
    const calculateProfileCompleteness = () => {
      const profile = userStore.userProfile
      
      if (!profile) return 0
      
      // 定义要检查的关键字段
      const keyFields = [
        'height', 'weight', 'bodyShape', 'skinTone', 
        'preferredStyles', 'dislikedStyles', 'colorPreferences'
      ]
      
      // 检查每个字段是否有值
      let filledFields = 0
      for (const field of keyFields) {
        if (profile[field] && 
            ((typeof profile[field] === 'string' && profile[field].trim() !== '') || 
             (Array.isArray(profile[field]) && profile[field].length > 0) ||
             (typeof profile[field] === 'number' && profile[field] > 0))) {
          filledFields++
        }
      }
      
      // 计算百分比
      return Math.round((filledFields / keyFields.length) * 100)
    }
    
    // 检查是否有用户画像
    const hasUserProfile = computed(() => !!userStore.userProfile)
    
    return {
      // 返回计算完整度的函数和用户画像状态
      calculateProfileCompleteness,
      hasUserProfile,
      externalDataStore,
      isLocationLoading
    }
  },
  data() {
    const userStore = useUserStore()
    const externalDataStore = useExternalDataStore()
    
    return {
      useProfile: !!userStore.userProfile,
      profileCompleteness: this.calculateProfileCompleteness(),
      selectedScene: '',
      selectedTags: [],
      gender: '',
      additionalInfo: '',
      loading: false,
      loadingMessage: '正在生成穿搭方案...',
      scenes: [
        { name: '商务正式', icon: 'fa-briefcase' },
        { name: '休闲日常', icon: 'fa-coffee' },
        { name: '约会', icon: 'fa-heart' },
        { name: '运动', icon: 'fa-dumbbell' },
        { name: '派对', icon: 'fa-glass-cheers' },
        { name: '更多', icon: 'fa-plus' }
      ],
      imageTags: ['优雅知性', '活力运动', '甜美可爱', '简约时尚', '成熟稳重'],
      externalDataStore // 添加到data中
    }
  },
  methods: {
    selectScene(scene) {
      this.selectedScene = scene
    },
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags.splice(index, 1)
      }
    },
    selectGender(gender) {
      this.gender = gender
    },
    async handleNext() {
      // 表单验证
      if (!this.selectedScene) {
        alert('请选择穿搭场景')
        return
      }
      
      if (this.selectedTags.length === 0) {
        alert('请至少选择一个形象标签')
        return
      }
      
      if (!this.gender) {
        alert('请选择性别')
        return
      }

      // 集成性别信息到提示词
      let enhancedAdditionalInfo = this.additionalInfo || ''
      if (this.gender === 'male') {
        enhancedAdditionalInfo += '，针对男性穿搭'
      } else {
        enhancedAdditionalInfo += '，针对女性穿搭'
      }

      this.loading = true

      try {
        // 获取用户ID
        const userStore = useUserStore()
        const userId = userStore.userInfo ? userStore.userInfo.id : ''
        
        // 准备请求参数 - 严格按照API文档 OutfitRecommendRequestVO 结构
        const requestData = {
          userId: userId,
          ipAddress: this.externalDataStore.locationData.city || '未知位置',
          scene: this.selectedScene,
          features: this.selectedTags.join(','),
          additionalInfo: enhancedAdditionalInfo,
          weather: '', // 可选参数
          luckyColor: '', // 可选参数
          schedule: '' // 可选参数
        }
        
        // 如果有天气信息，按照API文档格式添加
        if (this.externalDataStore.weatherData && this.externalDataStore.weatherData.text !== '加载中') {
          requestData.weather = `${this.externalDataStore.weatherData.text} ${this.externalDataStore.weatherData.temp}°C`
        }
        
        // TODO: 取消注释使用真实API
        // const response = await getOutfitRecommend(requestData)
        
        // TODO: 移除模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // TODO: 移除模拟API响应 - 符合 OutfitRecommendResponseVO 结构
        let mockResponse = {
          readablePlan: `## 穿搭方案\n\n### 上装\n简约白色T恤，搭配浅蓝色休闲衬衫作为外层。\n\n### 下装\n直筒深蓝色牛仔裤，裤长合适，略微修身。\n\n### 鞋子配饰\n灰色低帮帆布鞋，搭配简约棕色皮带和银色手表。\n\n### 搭配要点\n- 整体色调协调，蓝白灰色系清爽自然\n- 宽松但不松垮，保持整洁有型的整体感\n- 适合休闲场合，同时兼具简约时尚气质`,
          imagePrompt: `young ${this.gender === 'male' ? 'man' : 'woman'} wearing simple white t-shirt, light blue casual shirt, dark blue straight jeans, grey canvas shoes, minimal accessories, casual everyday style, clean modern background, natural lighting, 4k quality, professional fashion photography`,
          summary: '简约日常风格穿搭，以蓝白灰为主色调，舒适自然又不失型格'
        }
        
        // 初始化 outfitResult store
        const outfitStore = useOutfitResultStore()
        outfitStore.setInitialRecommendation(mockResponse)
        
        // 导航到结果页面 - 不再传递参数
        this.$router.push({
          name: 'outfit-result'
        })
      } catch (error) {
        console.error('获取穿搭推荐失败', error)
        alert('获取穿搭推荐失败，请稍后再试')
      } finally {
        this.loading = false
      }
    },
    
    // 生成基于用户画像的个性化推荐响应
    generatePersonalizedResponse(profile) {
      // 这里实现基于用户画像数据的个性化推荐逻辑
      // 实际项目中，这部分逻辑应该由后端实现
      
      // 示例：根据身材类型调整建议
      let topSuggestion = ''
      let bottomSuggestion = ''
      
      if (profile.bodyShape === 'pear') {
        topSuggestion = '宽松上衣搭配轻薄外套，增加肩部视觉宽度平衡身材比例。'
        bottomSuggestion = '直筒裤型或A字裙，避免过于紧身的下装。'
      } else if (profile.bodyShape === 'apple') {
        topSuggestion = 'V领上衣搭配垂直条纹开衫，拉长上半身视觉线条。'
        bottomSuggestion = '高腰直筒裤或喇叭裤，平衡身材比例。'
      } else if (profile.bodyShape === 'hourglass') {
        topSuggestion = '合身上衣搭配腰部收紧的外套，突出腰线。'
        bottomSuggestion = '修身裤型或高腰裙，展现曲线美。'
      } else {
        topSuggestion = '简约合身上衣，搭配轻薄外套增加层次感。'
        bottomSuggestion = '修身直筒裤，展现自然腿部线条。'
      }
      
      // 根据颜色偏好调整
      let colorScheme = '中性色调为主'
      if (profile.colorPreferences && profile.colorPreferences.length > 0) {
        colorScheme = `以${profile.colorPreferences[0]}为主色调，搭配协调色系`
      }
      
      return {
        readablePlan: `## 穿搭方案\n\n### 上装\n${topSuggestion}\n\n### 下装\n${bottomSuggestion}\n\n### 鞋子配饰\n选择${colorScheme}的鞋履，搭配简约配饰增加质感。\n\n### 搭配要点\n- ${colorScheme}，突出个人气质\n- 结合您的身材特点，强调优势部位\n- 根据您的风格偏好，兼顾时尚感与舒适度`,
        imagePrompt: `young ${this.gender === 'male' ? 'man' : 'woman'} with ${profile.bodyShape || 'average'} body type, wearing outfit that complements their physique, ${profile.colorPreferences ? profile.colorPreferences[0] : 'neutral'} color scheme, ${profile.preferredStyles ? profile.preferredStyles[0] : 'casual'} style, clean modern background, natural lighting, 4k quality, professional fashion photography`,
        summary: '基于您的身材特点和风格偏好定制的个性化穿搭方案'
      }
    }
  }
}
</script>

<style>
/* 由于使用了Tailwind CSS，这里不需要额外的样式 */
</style> 