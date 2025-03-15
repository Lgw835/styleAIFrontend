<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="穿搭推荐" 
      :backLink="'/'"
      class="bg-white border-b"
    >
      <template #right-action>
        <button class="text-gray-500 hover:text-blue-500" @click="openHistoryModal">
          <i class="fas fa-history"></i>
        </button>
      </template>
    </SubPageNavBar>

    <!-- 主要内容区 -->
    <div class="flex-1 pt-12 pb-4 transition-opacity duration-300">
      <!-- 加载指示器 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          <p class="mt-3 text-gray-600">{{loadingMessage}}</p>
        </div>
      </div>

      <div v-else class="p-4 space-y-4">
        <!-- 步骤指示器 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <div class="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              当前版本: {{ currentVersion }}
            </div>
          </div>
          
          <button @click="openHistoryModal" 
                  class="text-sm text-blue-500 flex items-center">
            <i class="fas fa-history mr-1"></i>
            历史版本
          </button>
        </div>

        <!-- 穿搭方案 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-3">穿搭方案</h3>
          <div class="prose prose-sm text-gray-600 leading-relaxed" v-if="outfitPlan">
            <!-- 使用 Markdown 渲染组件 -->
            <MarkdownRenderer :markdown="outfitPlan" />
          </div>
          <div v-else class="text-gray-400 text-center py-4">
            尚未生成穿搭方案
          </div>
        </div>

        <!-- AI提示词 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium">AI提示词</h3>
            <button class="text-sm text-blue-500" @click="openPromptModal">编辑</button>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p>{{ aiPrompt || '尚未生成提示词' }}</p>
          </div>
        </div>

        <!-- 穿搭效果图 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium">穿搭效果图</h3>
            <div class="flex space-x-2" v-if="outfitImage">
              <button class="text-gray-600 hover:text-blue-500" @click="regenerateImage">
                <i class="fas fa-redo"></i>
                <span class="text-sm ml-1">重新生成</span>
              </button>
              <button class="text-gray-600 hover:text-blue-500" @click="downloadImage">
                <i class="fas fa-download"></i>
                <span class="text-sm ml-1">保存图片</span>
              </button>
            </div>
          </div>
          
          <!-- 生成按钮 -->
          <div v-if="!isGenerating && !outfitImage" 
               @click="generateImage"
               class="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors">
            <i class="fas fa-magic text-xl mr-2"></i>
            <span>点击生成穿搭效果图</span>
          </div>

          <!-- 生成进度 -->
          <div v-if="isGenerating" class="space-y-4">
            <div class="flex items-center justify-center space-x-3">
              <div class="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
              <span class="text-blue-500">{{ generatingStatus }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full transition-all duration-300"
                   :style="{ width: `${generatingProgress}%` }"></div>
            </div>
          </div>

          <!-- 图片展示 -->
          <div v-if="outfitImage" class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
            <img :src="outfitImage" alt="穿搭效果图" class="w-full h-auto object-cover">
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-4 px-4 pb-6">
          <button class="flex-1 bg-white border border-blue-500 text-blue-500 py-3 rounded-lg"
                  @click="openModifyModal">
            修改方案
          </button>
          <button class="flex-1 bg-blue-500 text-white py-3 rounded-lg"
                  @click="openSaveModal">
            保存到记录
          </button>
        </div>
      </div>
    </div>

    <!-- 各种模态框组件 -->
    <PromptModal 
      v-model:show="showPromptModal"
      :prompt="aiPrompt"
      @update:prompt="updatePrompt"
    />
    
    <SaveModal 
      v-model:show="showSaveModal"
      :initialRating="saveModalData.rating"
      :initialComment="saveModalData.comment"
      @save="saveOutfit"
      @later="saveForLater"
      @cancel="showSaveModal = false"
    />
    
    <ModifyModal 
      v-model:show="showModifyModal"
      @modify="modifyOutfit"
    />
    
    <HistoryModal 
      v-model:show="showHistoryModal"
      :versions="versionHistory"
      :currentVersion="currentVersion"
      @restore="restoreVersion"
    >
      <template #confirm-message>
        <div class="text-sm text-gray-500 mt-2">
          切换版本将替换当前方案，您确定要继续吗？
        </div>
      </template>
    </HistoryModal>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import PromptModal from '@/components/modals/PromptModal.vue'
import SaveModal from '@/components/modals/SaveModal.vue'
import ModifyModal from '@/components/modals/ModifyModal.vue'
import HistoryModal from '@/components/modals/HistoryModal.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { generateOutfitImage, followUpOutfit, saveOutfit } from '@/api/outfit'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { useOutfitResultStore } from '@/stores/outfitResult'
import { useOutfitRecordStore } from '@/stores/outfitRecord'
import { showToast } from 'vant'

export default {
  name: 'OutfitResultView',
  
  components: {
    SubPageNavBar,
    PromptModal,
    SaveModal,
    ModifyModal,
    HistoryModal,
    MarkdownRenderer
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const externalDataStore = useExternalDataStore()
    const userStore = useUserStore()
    const outfitStore = useOutfitResultStore()
    const outfitRecordStore = useOutfitRecordStore()
    
    // 加载状态
    const loading = ref(false)
    const loadingMessage = ref('加载穿搭方案...')
    
    // 获取路由参数
    const scene = route.query.scene || ''
    const tags = (route.query.tags || '').split(',').filter(Boolean)
    const gender = route.query.gender || ''
    const useProfile = route.query.useProfile === 'true'
    const additionalInfo = route.query.additionalInfo || ''
    
    // 构建推荐数据对象
    const recommendData = {
      useProfile,
      selectedScene: scene,
      selectedTags: tags,
      gender,
      additionalInfo
    }
    
    // 图片生成相关
    const isGenerating = ref(false)
    const generatingProgress = ref(0)
    const generatingStatus = ref('正在生成中...')
    
    // 模态框控制
    const showPromptModal = ref(false)
    const showSaveModal = ref(false)
    const showModifyModal = ref(false)
    const showHistoryModal = ref(false)

    // 从Pinia store引用computed值以确保响应式
    const outfitPlan = computed(() => outfitStore.outfitPlan)
    const aiPrompt = computed(() => outfitStore.aiPrompt)
    const outfitImage = computed(() => outfitStore.outfitImage)
    const currentVersion = computed(() => outfitStore.currentVersion)
    const versionHistory = computed(() => outfitStore.versionHistory)
    const canSave = computed(() => outfitStore.canSave)

    // 当前穿搭数据
    const outfitResult = ref(null)
    // 保存状态
    const isSaved = ref(false)

    // 保存模态框数据
    const saveModalData = reactive({
      rating: 0,
      comment: ''
    })
    
    // 初始化保存模态框数据
    const initSaveModalData = () => {
      saveModalData.rating = 0
      saveModalData.comment = ''
    }
    
    // 打开保存模态框
    const openSaveModal = () => {
      // 检查是否有可保存的内容
      if (!outfitStore.outfitPlan || !outfitStore.outfitImage) {
        showToast('请先生成穿搭方案和效果图')
        return
      }
      
      // 初始化保存模态框数据
      initSaveModalData()
      
      // 打开模态框
      showSaveModal.value = true
    }
    
    // 保存穿搭（带评价）
    const saveOutfit = async (saveData) => {
      try {
        // 显示加载中
        loading.value = true
        loadingMessage.value = "正在保存穿搭方案..."
        
        // 组装穿搭数据 - 严格按照 OutfitSaveRequestVO 结构
        const outfitData = {
          userId: userStore.userInfo?.id || '',
          ipAddress: externalDataStore.locationData?.city || '未知位置',
          outfitDescription: JSON.stringify(outfitStore.outfitPlan || {}),
          aiPromptDescription: outfitStore.aiPrompt || '',
          outfitImageUrl: outfitStore.outfitImage || '',
          requirementText: '', // 可以使用场景信息
          sceneId: route.query.scene || '',
          highlightImageUrl: '' // 暂无高亮图
        }
        
        // TODO: 当API可用时，使用真实的API调用
        // const response = await saveOutfitToAPI(outfitData)
        // const outfitId = response.data.id
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        const outfitId = `outfit_${Date.now()}`
        
        // 将数据添加到本地 store - 转换为 store 需要的格式
        const storeOutfitData = {
          id: outfitId,
          userId: userStore.userInfo?.id || '',
          imageUrl: outfitStore.outfitImage || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          outfitDescription: JSON.stringify(outfitStore.outfitPlan || {}),
          aiPromptDescription: outfitStore.aiPrompt || '',
          sceneId: route.query.scene || '',
          // 评分和评论单独存储，不在这里设置
        }
        
        // 添加到本地 store
        await outfitRecordStore.addOutfit(storeOutfitData)
        
        // 关闭模态框
        showSaveModal.value = false
        
        // 显示成功提示
        showToast('穿搭方案已保存')
        
        // 提交评价 - 严格按照 OutfitCommentSaveRequestVO 结构
        if (saveData.rating > 0 && saveData.comment?.trim()) {
          const commentData = {
            userId: userStore.userInfo?.id || '',
            ipAddress: externalDataStore.locationData?.city || '未知位置',
            outfitId: outfitId,
            score: saveData.rating,
            comment: saveData.comment
          }
          
          await submitEvaluation(commentData)
        }

        router.push('/')
        
        return true
      } catch (error) {
        console.error('保存穿搭方案失败', error)
        showToast('保存失败，请重试')
        return false
      } finally {
        loading.value = false
      }
    }
    
    // 稍后评价并保存
    const saveForLater = async () => {
      try {
        // 显示加载中
        loading.value = true
        loadingMessage.value = "正在保存穿搭方案..."
        
        // 组装穿搭数据 - 严格按照 OutfitSaveRequestVO 结构
        const outfitData = {
          userId: userStore.userInfo?.id || '',
          ipAddress: externalDataStore.locationData?.city || '未知位置',
          outfitDescription: JSON.stringify(outfitStore.outfitPlan || {}),
          aiPromptDescription: outfitStore.aiPrompt || '',
          outfitImageUrl: outfitStore.outfitImage || '',
          requirementText: '', // 可以使用场景信息
          sceneId: route.query.scene || '',
          highlightImageUrl: '' // 暂无高亮图
        }
        
        // TODO: 当API可用时，使用真实的API调用
        // const response = await saveOutfitToAPI(outfitData)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        const outfitId = `outfit_${Date.now()}`
        
        // 将数据添加到本地 store - 转换为 store 需要的格式
        const storeOutfitData = {
          id: outfitId,
          userId: userStore.userInfo?.id || '',
          imageUrl: outfitStore.outfitImage || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          outfitDescription: JSON.stringify(outfitStore.outfitPlan || {}),
          aiPromptDescription: outfitStore.aiPrompt || '',
          sceneId: route.query.scene || '',
          // 无评分和评论
        }
        
        // 添加到本地store
        await outfitRecordStore.addOutfit(storeOutfitData)
        
        // 关闭模态框
        showSaveModal.value = false
        
        // 显示成功提示
        showToast('穿搭方案已保存，您可以稍后在记录中评价')
        
        // 保存成功后返回首页
        setTimeout(() => {
          router.push('/')
        }, 1000)
        
        return true
      } catch (error) {
        console.error('保存穿搭方案失败', error)
        showToast('保存失败，请重试')
        return false
      } finally {
        loading.value = false
      }
    }
    
    // 格式化穿搭数据，用于保存
    const formatOutfitData = (saveData) => {
      const now = new Date().toISOString()
      
      return {
        id: `outfit_${Date.now()}`,
        userId: userStore.userInfo?.id || 'temp_user',
        title: saveData.title,
        description: saveData.description,
        outfitImageUrl: outfitStore.outfitImage || '',
        createdAt: now,
        updatedAt: now,
        tags: saveData.tags || [],
        score: null,
        comment: '',
        aiPromptDescription: outfitStore.aiPrompt || '',
        outfitDescription: outfitStore.outfitPlan || ''
      }
    }
    
    // 提交评价
    const submitEvaluation = async (commentData) => {
      try {
        // TODO: 当API可用时，使用真实的API调用
        // const response = await submitOutfitEvaluation(commentData)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 实际上在评价时，outfitRecordStore.submitEvaluation 方法会自动更新对应的穿搭评分
        await outfitRecordStore.submitEvaluation(commentData)
        
        return true
      } catch (error) {
        console.error('提交评价失败', error)
        return false
      }
    }
    
    // 保存到API的函数（当API可用时使用）
    const saveOutfitToAPI = async (outfitData) => {
      // 构建API请求格式
      const requestData = {
        userId: outfitData.userId,
        ipAddress: externalDataStore.locationData?.city || '未知位置',
        outfitDescription: JSON.stringify(outfitData.outfitData),
        aiPromptDescription: outfitData.aiDescription,
        outfitImageUrl: outfitData.imageUrl,
        requirementText: outfitData.description,
        sceneId: route.query.scene || 'default',
        highlightImageUrl: '' // 暂无高亮图
      }
      
      // TODO: 调用真实API
      // return await saveOutfit(requestData)
      
      // 模拟API响应
      await new Promise(resolve => setTimeout(resolve, 800))
      return {
        data: {
          id: `outfit_${Date.now()}`,
          success: true,
          message: '保存成功'
        }
      }
    }

    // 从路由参数或API获取初始数据
    const initData = async () => {
      loading.value = true
      
      try {
        // 从 Pinia store 获取数据
        // 尝试从会话存储恢复数据（处理刷新情况）
        outfitStore.restoreFromSession()
        
        // 检查是否有数据
        if (outfitStore.versionHistory.length === 0) {
          // 如果没有数据，使用默认数据
          await useDefaultData()
        }
      } catch (error) {
        console.error('初始化数据失败', error)
        await useDefaultData()
      } finally {
        loading.value = false
      }
    }
    
    // 模拟API调用
    const mockApiCall = async () => {
      // TODO: 取消模拟API调用，使用真实API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockData = {
        readablePlan: `## 穿搭方案\n\n### 上装\n简约白色T恤，搭配浅蓝色休闲衬衫作为外层。\n\n### 下装\n直筒深蓝色牛仔裤，裤长合适，略微修身。\n\n### 鞋子配饰\n灰色低帮帆布鞋，搭配简约棕色皮带和银色手表。\n\n### 搭配要点\n- 整体色调协调，蓝白灰色系清爽自然\n- 宽松但不松垮，保持整洁有型的整体感\n- 适合休闲场合，同时兼具简约时尚气质`,
        imagePrompt: `young ${gender === 'male' ? 'man' : 'woman'} wearing simple white t-shirt, light blue casual shirt, dark blue straight jeans, grey canvas shoes, minimal accessories, casual everyday style, clean modern background, natural lighting, 4k quality, professional fashion photography`,
        summary: '简约日常风格穿搭，以蓝白灰为主色调，舒适自然又不失型格'
      }
      
      outfitStore.parseOutfitPlan(mockData.readablePlan)
      outfitStore.aiPrompt = mockData.imagePrompt
      outfitStore.addToVersionHistory('初始方案', mockData.summary)
    }
    
    // 使用默认数据
    const useDefaultData = () => {
      const plan = {
        top: '简约白色T恤，搭配浅蓝色休闲衬衫作为外层。',
        bottom: '直筒深蓝色牛仔裤，裤长合适，略微修身。',
        accessories: '灰色低帮帆布鞋，搭配简约棕色皮带和银色手表。',
        keyPoints: [
          '整体色调协调，蓝白灰色系清爽自然',
          '宽松但不松垮，保持整洁有型的整体感',
          '适合休闲场合，同时兼具简约时尚气质'
        ]
      }
      
      outfitStore.outfitPlan = plan
      outfitStore.aiPrompt = `young ${gender === 'male' ? 'man' : 'woman'} wearing simple white t-shirt, light blue casual shirt, dark blue straight jeans, grey canvas shoes, minimal accessories, casual everyday style, clean modern background, natural lighting, 4k quality, professional fashion photography`
      
      outfitStore.addToVersionHistory('初始方案', '默认推荐方案')
    }
    
    // 生成图片函数 - 使用模拟URL实现前端效果
    const generateImage = async () => {
      if (isGenerating.value) return
      
      isGenerating.value = true
      generatingProgress.value = 0
      generatingStatus.value = '正在准备图片生成...'
      
      // 设置进度条更新
      const interval = setInterval(() => {
        if (generatingProgress.value < 95) {
          generatingProgress.value += Math.floor(Math.random() * 10)
          updateGeneratingStatus()
        }
      }, 800)
      
      try {
        // 获取用户ID
        const userId = userStore.userInfo ? userStore.userInfo.id : ''
        
        // 准备请求参数 - 严格按照 OutfitImageGenerateRequestVO 结构
        const requestData = {
          userId: userId,
          ipAddress: externalDataStore.locationData?.city || '未知位置',
          aiPromptDescription: outfitStore.aiPrompt
        }
        
        // TODO: 接入后端API进行图片生成
        // const response = await generateOutfitImage(requestData)
        // const imageUrl = response.imageUrl
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // 模拟不同的穿搭图片URL - 使用随机选择增加变化感
        const demoImageUrls = [
          'https://img.freepik.com/free-photo/stylish-man-studio_144627-28228.jpg',
          'https://img.freepik.com/premium-photo/full-length-portrait-handsome-serious-man-black-clothes-posing-studio-isolated-dark-background_171337-93127.jpg',
          'https://img.freepik.com/premium-photo/young-handsome-man-casual-clothes_85574-6400.jpg',
          'https://img.freepik.com/free-photo/portrait-handsome-smiling-stylish-young-man-model-dressed-red-checkered-shirt-fashion-man-posing_158538-4909.jpg',
          'https://img.freepik.com/premium-photo/modern-business-man-formal-clothes-standing-against-white-background-office_37714-804.jpg'
        ]
        
        // 随机选择一个图片URL
        const randomIndex = Math.floor(Math.random() * demoImageUrls.length)
        const imageUrl = demoImageUrls[randomIndex]
        
        generatingProgress.value = 100
        generatingStatus.value = '图片生成完成！'
        
        // 直接修改store中的值
        outfitStore.outfitImage = imageUrl
        
        // 更新当前版本历史中的图片
        outfitStore.addToVersionHistory('生成图片', '为当前穿搭方案生成效果图')
        
        // 等待进度条动画完成
        setTimeout(() => {
          isGenerating.value = false
        }, 500)
      } catch (error) {
        console.error('生成图片失败', error)
        generatingStatus.value = '生成失败，请重试'
        setTimeout(() => {
          isGenerating.value = false
        }, 1500)
      } finally {
        clearInterval(interval)
      }
    }

    // 更新生成状态的辅助函数
    const updateGeneratingStatus = () => {
      const progress = generatingProgress.value
      if (progress < 30) {
        generatingStatus.value = '正在分析穿搭方案...'
      } else if (progress < 60) {
        generatingStatus.value = '正在生成穿搭效果图...'
      } else if (progress < 90) {
        generatingStatus.value = '正在优化图片细节...'
      } else {
        generatingStatus.value = '即将完成...'
      }
    }

    // 重新生成图片
    const regenerateImage = () => {
      if (confirm('确定要重新生成图片吗？当前图片将被替换。')) {
        generateImage()
        showToast('开始重新生成图片', 'info')
      }
    }

    // 下载图片
    const downloadImage = () => {
      if (!outfitImage.value) return
      
      try {
        // 创建临时链接并触发下载
        const link = document.createElement('a')
        link.href = outfitImage.value
        link.download = `穿搭效果图_${new Date().toISOString().slice(0, 10)}.jpg`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        showToast('图片已开始下载', 'success')
      } catch (error) {
        console.error('下载图片失败', error)
        showToast('下载图片失败', 'error')
      }
    }

    // 更新提示词
    const updatePrompt = (newPrompt) => {
      outfitStore.setAiPrompt(newPrompt)
      showPromptModal.value = false
    }

    // 修改穿搭方案 - 对接 /outfitApi/followup 接口
    const modifyOutfit = (modifications) => {
      // 更新穿搭方案
      outfitStore.updateOutfitPlan(modifications)
      showModifyModal.value = false
    }

    // 恢复历史版本 - 简化逻辑，确保版本切换正确
    const restoreVersion = (version) => {
      if (!version) return
      
      // 添加过渡效果
      const contentArea = document.querySelector('.flex-1.pt-12.pb-4')
      if (contentArea) {
        contentArea.style.opacity = '0.5'
        contentArea.style.transition = 'opacity 0.3s'
      }
      
      // 直接恢复版本
      outfitStore.restoreVersion(version)
      
      // 恢复内容区域显示
      if (contentArea) {
        setTimeout(() => {
          contentArea.style.opacity = '1'
        }, 300)
      }
      
      // 关闭模态框
      showHistoryModal.value = false
      
      // 显示成功提示
      showToast(`已恢复到版本 ${version.version}`, 'success')
    }
    
    // 版本切换后的提示 - 使用更美观的Toast通知
    const showVersionChangeToast = (version) => {
      // 创建Toast元素
      const toastContainer = document.createElement('div')
      toastContainer.className = 'fixed bottom-4 left-0 right-0 flex justify-center items-center z-50 pointer-events-none'
      
      const toast = document.createElement('div')
      toast.className = 'bg-blue-500 text-white py-3 px-5 rounded-lg shadow-lg flex items-center space-x-3 transform translate-y-10 opacity-0 transition-all duration-500'
      
      // 添加图标
      const icon = document.createElement('i')
      icon.className = 'fas fa-history text-lg'
      
      // 添加文本信息
      const textContainer = document.createElement('div')
      const title = document.createElement('div')
      title.className = 'font-medium text-sm'
      title.textContent = `已恢复到版本 ${version.version}: ${version.description}`
      
      const subtitle = document.createElement('div') 
      subtitle.className = 'text-xs text-blue-100'
      subtitle.textContent = version.timestamp
      
      textContainer.appendChild(title)
      textContainer.appendChild(subtitle)
      
      // 组装Toast
      toast.appendChild(icon)
      toast.appendChild(textContainer)
      toastContainer.appendChild(toast)
      document.body.appendChild(toastContainer)
      
      // 显示Toast
      setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0')
        toast.classList.add('translate-y-0', 'opacity-1')
        
        // 3秒后隐藏
        setTimeout(() => {
          toast.classList.add('translate-y-10', 'opacity-0')
          setTimeout(() => {
            document.body.removeChild(toastContainer)
          }, 500)
        }, 3000)
      }, 10)
    }
    
    // 打开各种模态框
    const openPromptModal = () => { showPromptModal.value = true }
    const openModifyModal = () => { showModifyModal.value = true }
    const openHistoryModal = () => { showHistoryModal.value = true }
    
    // 生命周期钩子 - 组件挂载后初始化数据
    onMounted(() => {
      initData()
      // 初始化保存模态框数据
      initSaveModalData()
    })

    // 监听路由变化，在离开页面时清除数据
    onBeforeRouteLeave((to, from, next) => {
      // 如果不是返回到DressRecommendView，则清除数据
      if (to.name !== 'dress-recommend') {
        outfitStore.resetAll()
      }
      next()
    })

    // 通用的Toast消息函数
    const showToast = (message, type = 'info') => {
      // 创建Toast元素
      const toastContainer = document.createElement('div')
      toastContainer.className = 'fixed bottom-4 left-0 right-0 flex justify-center items-center z-50 pointer-events-none'
      
      // 根据消息类型设置样式
      let bgColor = 'bg-blue-500'
      let icon = 'fa-info-circle'
      
      if (type === 'success') {
        bgColor = 'bg-green-500'
        icon = 'fa-check-circle'
      } else if (type === 'error') {
        bgColor = 'bg-red-500'
        icon = 'fa-exclamation-circle'
      } else if (type === 'warning') {
        bgColor = 'bg-yellow-500'
        icon = 'fa-exclamation-triangle'
      }
      
      const toast = document.createElement('div')
      toast.className = `${bgColor} text-white py-3 px-5 rounded-lg shadow-lg flex items-center space-x-3 transform translate-y-10 opacity-0 transition-all duration-500`
      
      // 添加图标
      const iconElement = document.createElement('i')
      iconElement.className = `fas ${icon} text-lg`
      
      // 添加文本信息
      const text = document.createElement('div')
      text.className = 'font-medium text-sm'
      text.textContent = message
      
      // 组装Toast
      toast.appendChild(iconElement)
      toast.appendChild(text)
      toastContainer.appendChild(toast)
      document.body.appendChild(toastContainer)
      
      // 显示Toast
      setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0')
        toast.classList.add('translate-y-0', 'opacity-1')
        
        // 3秒后隐藏
        setTimeout(() => {
          toast.classList.add('translate-y-10', 'opacity-0')
          setTimeout(() => {
            document.body.removeChild(toastContainer)
          }, 500)
        }, 3000)
      }, 10)
    }

    // 添加上传图片的方法
    const uploadImage = async (imgBase64) => {
      try {
        loading.value = true
        loadingMessage.value = "正在上传图片..."
        
        // 将Base64转为Blob
        const base64Response = await fetch(imgBase64);
        const blob = await base64Response.blob();
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', blob, 'outfit-image.jpg');
        
        // TODO: 调用上传图片接口
        // const response = await uploadOutfitImage(formData)
        // if (response && response.data && response.data.fileUrl) {
        //   return response.data.fileUrl
        // }
        
        // 模拟上传延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟返回URL
        return imgBase64 // 实际应该返回服务器图片URL
        
      } catch (error) {
        console.error('上传图片失败', error)
        throw new Error('图片上传失败，请重试')
      } finally {
        loading.value = false
      }
    }

    // 添加保存穿搭推荐的方法
    const saveOutfitRecommendation = async () => {
      try {
        loading.value = true
        loadingMessage.value = "正在保存穿搭推荐..."
        
        // 上传图片获取URL
        const imageUrl = await uploadImage(outfitImage.value)
        
        // 准备请求数据
        const requestData = {
          userId: userStore.userInfo?.id,
          title: saveModalData.title,
          description: saveModalData.description,
          imageUrl: imageUrl,
          outfitData: {
            top: outfitPlan.value.top,
            bottom: outfitPlan.value.bottom,
            accessories: outfitPlan.value.accessories,
            keyPoints: outfitPlan.value.keyPoints
          },
          aiDescription: outfitPlan.value.aiDescription || formatOutfitPlanToString(outfitPlan.value),
          tags: saveModalData.tags || []
        }
        
        // TODO: 调用保存穿搭接口
        // const response = await saveOutfit(requestData)
        // if (response && response.data && response.data.id) {
        //   return response.data.id
        // }
        
        // 模拟请求延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟返回ID
        return 'outfit_' + Date.now()
        
      } catch (error) {
        console.error('保存穿搭推荐失败', error)
        throw new Error('保存失败，请稍后再试')
      } finally {
        loading.value = false
      }
    }

    // 更新现有的saveToRecord方法（仅打开模态框，不直接保存）
    const saveToRecord = () => {
      openSaveModal()
    }

    return {
      // 使用computed引用store的状态
      outfitPlan,
      aiPrompt,
      outfitImage,
      currentVersion,
      versionHistory,
      canSave,
      
      // 本地状态
      loading,
      loadingMessage,
      isGenerating,
      generatingProgress,
      generatingStatus,
      
      // 模态框控制
      showPromptModal,
      showSaveModal,
      showModifyModal,
      showHistoryModal,
      
      // 方法
      generateImage,
      regenerateImage,
      downloadImage,
      openPromptModal,
      updatePrompt,
      openSaveModal,
      saveOutfit,
      saveForLater,
      openModifyModal,
      modifyOutfit,
      openHistoryModal,
      restoreVersion,
      
      // 外部数据存储
      externalDataStore,
      
      // 新增或修改的状态和方法
      saveModalData,
      saveToRecord
    }
  }
}
</script>

<style scoped>
.prose {
  max-width: none;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 