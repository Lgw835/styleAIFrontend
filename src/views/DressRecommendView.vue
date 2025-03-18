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
import { useRouter } from 'vue-router'
import { recommendOutfit } from '@/api/outfitResult'
import { OUTFIT_API } from '@/api/config'

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
    const router = useRouter()
    
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
      const profileStr = userStore.userProfile
      
      if (!profileStr) return 0
      
      try {
        // 尝试将字符串解析为对象
        const profile = typeof profileStr === 'string' 
          ? JSON.parse(profileStr) 
          : profileStr
          
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
      } catch (error) {
        console.error('计算用户画像完整度失败:', error)
        return 0 // 解析失败返回0
      }
    }
    
    // 检查是否有用户画像
    const hasUserProfile = computed(() => {
      const profile = userStore.userProfile
      
      if (!profile) return false
      
      // 如果是字符串但只是空对象，也视为无效
      if (typeof profile === 'string' && 
         (profile === '{}' || profile === 'null' || profile === '')) {
        return false
      }
      
      return true
    })
    
    return {
      // 返回计算完整度的函数和用户画像状态
      calculateProfileCompleteness,
      hasUserProfile,
      externalDataStore,
      isLocationLoading,
      router,
      userStore
    }
  },
  data() {
    return {
      useProfile: !!this.userStore?.userProfile,
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
      imageTags: ['优雅知性', '活力运动', '甜美可爱', '简约时尚', '成熟稳重']
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
      // 检查用户是否登录
      if (!this.userStore || !this.userStore.isLoggedIn) {
        console.log('登录检查结果:', {
          storeExists: !!this.userStore,
          isLoggedIn: this.userStore?.isLoggedIn,
          hasUserInfo: !!this.userStore?.userInfo
        })
        this.$toast('请先登录')
        this.router.push('/login')
        return
      }
      
      // 检查用户信息是否完整
      const userId = this.userStore.userInfo?.userId
      if (!userId) {
        console.error('用户已登录但没有用户ID')
        this.$toast('用户信息不完整，请重新登录')
        this.router.push('/login')
        return
      }
      
      // 开始加载状态
      this.loading = true
      this.loadingMessage = '正在生成穿搭方案，请耐心等待...'
      
      try {
        // 准备要发送的数据
        const requestData = {
          userId: userId,
          ipAddress: this.externalDataStore.locationData?.city ? 
            `${this.externalDataStore.locationData.province || ''} ${this.externalDataStore.locationData.city}` : "",
          weather: "",
          scene: this.selectedScene || '休闲日常',
          features: this.selectedTags.join('，'),
          additionalInfo: this.additionalInfo || ""
        }
        
        // 处理用户画像信息并添加到附加信息中
        if (this.useProfile && this.userStore.userProfile) {
          try {
            // 尝试解析用户画像JSON
            const profileObj = JSON.parse(this.userStore.userProfile);
            
            // 开始构建用户画像信息，每个有值的字段都添加进来
            let profileInfo = [];
            
            // 添加性别
            if (profileObj.gender) {
              const userGender = profileObj.gender === 'male' ? '男' : profileObj.gender === 'female' ? '女' : profileObj.gender;
              profileInfo.push(`我的性别: ${userGender}`);
            }
            
            // 添加年龄
            if (profileObj.age) {
              profileInfo.push(`我的年龄: ${profileObj.age}岁`);
            }
            
            // 添加身高
            if (profileObj.height) {
              profileInfo.push(`我的身高: ${profileObj.height}cm`);
            }
            
            // 添加体重
            if (profileObj.weight) {
              profileInfo.push(`我的体重: ${profileObj.weight}kg`);
            }
            
            // 添加体型
            if (profileObj.bodyShape) {
              profileInfo.push(`我的体型: ${profileObj.bodyShape}`);
            }
            
            // 添加风格偏好
            if (profileObj.stylePreference) {
              profileInfo.push(`我的风格偏好: ${profileObj.stylePreference}`);
            }
            
            // 添加肤色
            if (profileObj.skinTone) {
              profileInfo.push(`我的肤色: ${profileObj.skinTone}`);
            }
            
            // 添加发色
            if (profileObj.hairColor) {
              profileInfo.push(`我的发色: ${profileObj.hairColor}`);
            }
            
            // 添加发长
            if (profileObj.hairLength) {
              profileInfo.push(`我的发长: ${profileObj.hairLength}`);
            }
            
            // 添加发型
            if (profileObj.hairStyle) {
              profileInfo.push(`我的发型: ${profileObj.hairStyle}`);
            }
            
            // 添加眼睛颜色
            if (profileObj.eyeColor) {
              profileInfo.push(`我的眼睛颜色: ${profileObj.eyeColor}`);
            }
            
            // 添加脸型
            if (profileObj.faceShape) {
              profileInfo.push(`我的脸型: ${profileObj.faceShape}`);
            }
            
            // 添加纹身描述
            if (profileObj.tattooDescription) {
              profileInfo.push(`我的纹身描述: ${profileObj.tattooDescription}`);
            }
            
            // 添加穿孔描述
            if (profileObj.piercingDescription) {
              profileInfo.push(`我的穿孔描述: ${profileObj.piercingDescription}`);
            }
            
            // 添加其他特征
            if (profileObj.otherFeatures) {
              profileInfo.push(`我的其他特征: ${profileObj.otherFeatures}`);
            }
            
            // 将所有信息合并为一个字符串，每项一行
            const profileInfoText = profileInfo.join('\n');
            
            // 添加到附加信息，并添加一个用户画像区域的标题
            if (profileInfoText) {
              requestData.additionalInfo = (requestData.additionalInfo ? requestData.additionalInfo + "\n\n" : "") 
                + "【用户画像信息】\n" + profileInfoText;
            }
          } catch (e) {
            console.error('解析用户画像失败:', e);
            // 解析失败时，添加原始性别信息
            const userGender = this.gender === 'male' ? '男' : this.gender === 'female' ? '女' : '未指定';
            requestData.additionalInfo = (requestData.additionalInfo ? requestData.additionalInfo + "\n" : "") + `性别: ${userGender}`;
          }
        } else if (this.gender) {
          // 如果没有使用用户画像但有性别选择
          const userGender = this.gender === 'male' ? '男' : '女';
          requestData.additionalInfo = (requestData.additionalInfo ? requestData.additionalInfo + "\n" : "") + `性别: ${userGender}`;
        }
        
        console.log('API 基础 URL:', import.meta.env.VITE_API_BASE_URL)
        console.log('发送穿搭推荐请求:', requestData)
        
        // 使用 recommendOutfit API 函数，不再使用 fetch
        const response = await recommendOutfit(requestData)
        console.log('API 返回原始数据:', response)
        
        // 检查返回的数据格式
        if (!response || typeof response !== 'object') {
          throw new Error('API返回数据格式不正确')
        }
        
        if (!response.readablePlan) {
          console.warn('API返回数据中没有readablePlan字段')
        }
        
        // 存储数据到 store
        const outfitResultStore = useOutfitResultStore()
        outfitResultStore.setInitialRecommendation(response)
        
        console.log('成功存储数据到store')
        
        // 跳转前增加延迟，确保数据已存储
        setTimeout(() => {
          this.router.push('/outfit-result')
        }, 500)
        
      } catch (error) {
        console.error('获取推荐失败:', error)
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
    },
    // 获取用户画像数据的辅助函数 - 确保返回结构化数据
    getUserProfileData() {
      if (!this.userStore || !this.userStore.userProfile) {
        return null
      }
      
      // 检查数据类型
      const profileData = this.userStore.userProfile
      
      // 如果是字符串，尝试解析为结构化数据
      if (typeof profileData === 'string') {
        try {
          return JSON.parse(profileData)
        } catch (error) {
          console.error('无法解析用户画像数据', error)
          return profileData // 返回原始字符串，保持兼容性
        }
      }
      
      // 如果已经是对象，直接返回
      return profileData
    },
    // 添加辅助方法从字符串中提取值
    extractProfileValue(key) {
      if (!this.userStore.userProfile) return null
      
      try {
        // 确保处理字符串
        const profileStr = this.userStore.userProfile
        
        // 尝试解析
        const profileObj = typeof profileStr === 'string' 
          ? JSON.parse(profileStr) 
          : profileStr
          
        return profileObj[key]
      } catch (e) {
        console.error(`提取用户画像属性 ${key} 失败`, e)
        return null
      }
    }
  }
}
</script>

<style>
/* 由于使用了Tailwind CSS，这里不需要额外的样式 */
</style> 