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
              @click="selectTag(tag)"
              class="px-4 py-2 rounded-full border"
              :class="{ 'bg-blue-50 border-blue-500': selectedTags.includes(tag) }"
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
          @click="handleRecommend"
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
import { recommendOutfit } from '@/api/outfit'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { computed, onMounted, ref } from 'vue'
import { useOutfitResultStore } from '@/stores/outfitResult'
import { useRouter } from 'vue-router'
import { OUTFIT_API } from '@/api/config'

export default {
  name: 'DressRecommendView',
  components: {
    SubPageNavBar
  },
  setup() {
    // 获取用户信息
    const userStore = useUserStore()
    const externalDataStore = useExternalDataStore()
    const router = useRouter()
    
    // 响应式状态定义
    const loading = ref(false)
    const loadingMessage = ref('正在生成穿搭方案...')
    const isLocationLoading = ref(false)
    const selectedScene = ref('')
    const selectedTags = ref([])
    const gender = ref('')
    const additionalInfo = ref('')
    const useProfile = ref(!!userStore?.userProfile)
    
    // 场景和标签数据
    const scenes = [
      { name: '商务正式', icon: 'fa-briefcase' },
      { name: '休闲日常', icon: 'fa-coffee' },
      { name: '约会', icon: 'fa-heart' },
      { name: '运动', icon: 'fa-dumbbell' },
      { name: '派对', icon: 'fa-glass-cheers' },
      { name: '更多', icon: 'fa-plus' }
    ]
    
    const imageTags = ['优雅知性', '活力运动', '甜美可爱', '简约时尚', '成熟稳重']
    
    // 计算用户画像完整度
    const calculateProfileCompleteness = () => {
      const profileStr = userStore.userProfile
      if (!profileStr) return 0
      
      try {
        const profile = typeof profileStr === 'string' 
          ? JSON.parse(profileStr) 
          : profileStr
          
        const keyFields = [
          'height', 'weight', 'bodyShape', 'skinTone', 
          'preferredStyles', 'dislikedStyles', 'colorPreferences'
        ]
        
        let filledFields = 0
        for (const field of keyFields) {
          if (profile[field] && 
              ((typeof profile[field] === 'string' && profile[field].trim() !== '') || 
               (Array.isArray(profile[field]) && profile[field].length > 0) ||
               (typeof profile[field] === 'number' && profile[field] > 0))) {
            filledFields++
          }
        }
        
        return Math.round((filledFields / keyFields.length) * 100)
      } catch (error) {
        console.error('计算用户画像完整度失败:', error)
        return 0
      }
    }
    
    // 计算属性
    const profileCompleteness = computed(() => calculateProfileCompleteness())
    const hasUserProfile = computed(() => {
      const profile = userStore.userProfile
      if (!profile) return false
      if (typeof profile === 'string' && 
         (profile === '{}' || profile === 'null' || profile === '')) {
        return false
      }
      return true
    })
    
    // 方法定义
    const selectScene = (scene) => {
      selectedScene.value = scene
      console.log('场景已选择:', scene)
    }
    
    const selectTag = (tag) => {
      if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag)
      } else {
        selectedTags.value.push(tag)
      }
      console.log('当前选中的标签:', selectedTags.value)
    }
    
    const selectGender = (value) => {
      gender.value = value
    }
    
    // 处理推荐请求
    const handleRecommend = async () => {
      try {
        loading.value = true
        loadingMessage.value = '正在生成穿搭方案...'
        
        // 检查用户是否登录
        if (!userStore || !userStore.isLoggedIn) {
          console.log('登录检查结果:', {
            storeExists: !!userStore,
            isLoggedIn: userStore?.isLoggedIn,
            hasUserInfo: !!userStore?.userInfo
          })
          $toast('请先登录')
          router.push('/login')
          return
        }
        
        // 检查用户信息是否完整
        const userId = userStore.userInfo?.userId
        if (!userId) {
          console.error('用户已登录但没有用户ID')
          $toast('用户信息不完整，请重新登录')
          router.push('/login')
          return
        }
        
        // 准备要发送的数据
        const requestData = {
          userId: userId,
          ipAddress: externalDataStore.locationData?.city ? 
            `${externalDataStore.locationData.province || ''} ${externalDataStore.locationData.city}` : "",
          weather: "",
          scene: selectedScene.value || '休闲日常',
          features: selectedTags.value.join('，'),
          additionalInfo: additionalInfo.value || ""
        }
        
        // 处理用户画像信息并添加到附加信息中
        if (useProfile.value && userStore.userProfile) {
          try {
            // 尝试解析用户画像JSON
            const profileObj = JSON.parse(userStore.userProfile);
            
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
            const userGender = gender.value === 'male' ? '男' : gender.value === 'female' ? '女' : '未指定';
            requestData.additionalInfo = (requestData.additionalInfo ? requestData.additionalInfo + "\n" : "") + `性别: ${userGender}`;
          }
        } else if (gender.value) {
          // 如果没有使用用户画像但有性别选择
          const userGender = gender.value === 'male' ? '男' : '女';
          requestData.additionalInfo = (requestData.additionalInfo ? requestData.additionalInfo + "\n" : "") + `性别: ${userGender}`;
        }
        
        console.log('API 基础 URL:', import.meta.env.VITE_API_BASE_URL)
        console.log('发送穿搭推荐请求:', requestData)
        
        // 调用API获取推荐
        const response = await recommendOutfit(requestData)
        console.log('API 返回原始数据:', response)
        
        // 检查返回的数据格式
        if (!response || typeof response !== 'object') {
          throw new Error('API返回数据格式不正确')
        }
        
        if (!response.readablePlan) {
          console.warn('API返回数据中没有readablePlan字段')
        }
        
        // 存储数据到 store - 修改这部分
        const outfitResultStore = useOutfitResultStore()
        
        // 打印当前选中的值，确认数据正确
        console.log('当前选中的场景:', selectedScene.value)
        console.log('当前选中的标签:', selectedTags.value)
        
        // 构建完整的数据对象
        const storeData = {
          ...response,
          sceneId: selectedScene.value,
          highlightTags: selectedTags.value.join('#')
        }
        
        console.log('准备存储到store的数据:', storeData)
        
        // 保存到store
        outfitResultStore.setInitialRecommendation(storeData)
        
        console.log('存储后的store数据:', {
          sceneId: outfitResultStore.sceneId,
          highlightTags: outfitResultStore.highlightTags
        })
        
        // 跳转前增加延迟，确保数据已存储
        setTimeout(() => {
          router.push('/outfit-result')
        }, 500)
        
      } catch (error) {
        console.error('获取推荐失败:', error)
      } finally {
        loading.value = false
      }
    }
    
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
    
    return {
      // 状态
      loading,
      loadingMessage,
      selectedScene,
      selectedTags,
      gender,
      additionalInfo,
      useProfile,
      profileCompleteness,
      isLocationLoading,
      
      // 静态数据
      scenes,
      imageTags,
      
      // 计算属性
      hasUserProfile,
      
      // 方法
      selectScene,
      selectTag,
      selectGender,
      handleRecommend,
      calculateProfileCompleteness,
      
      // Store
      userStore,
      externalDataStore,
      router
    }
  }
}
</script>

<style>
/* 由于使用了Tailwind CSS，这里不需要额外的样式 */
</style> 