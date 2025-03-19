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
          <div class="prose prose-sm text-gray-600 leading-relaxed" v-if="readablePlan">
            <!-- 使用 Markdown 渲染组件 -->
            <MarkdownRenderer :markdown="readablePlan" />
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
            <p>{{ imagePrompt || '尚未生成提示词' }}</p>
          </div>
        </div>

        <!-- 方案总结 -->
        <div v-if="summary" class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-3">方案总结</h3>
          <div class="text-sm text-gray-600">
            {{ summary }}
          </div>
        </div>

        <!-- 穿搭效果图 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium">穿搭效果图</h3>
            <div class="flex space-x-2" v-if="getCurrentVersionImage">
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
          
          <!-- 生成按钮 - 使用getCurrentVersionImage作为判断条件 -->
          <div v-if="!isGenerating && !getCurrentVersionImage" 
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
          <div v-if="getCurrentVersionImage" class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
            <img :src="getCurrentVersionImage" alt="穿搭效果图" class="w-full h-auto object-cover">
            <div class="absolute top-2 right-2">
              <button @click="debugImageData" class="bg-gray-800 bg-opacity-50 text-white p-1 rounded text-xs">
                <i class="fas fa-bug"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md pb-safe z-30">
          <div class="container mx-auto px-4 py-3 flex space-x-4 max-w-lg">
            <button
              @click="openModifyModal"
              class="flex-1 py-3 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <i class="fas fa-pencil-alt mr-2"></i>
              修改方案
            </button>
            <button
              @click="openSaveModal"
              class="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center shadow-sm"
              :disabled="!canSave"
              :class="{'opacity-50 cursor-not-allowed': !canSave}"
            >
              <i class="fas fa-save mr-2"></i>
              保存到记录
            </button>
          </div>
        </div>

        <!-- 添加底部占位空间，防止内容被底部按钮遮挡 -->
        <div class="h-20"></div>
      </div>
    </div>

    <!-- 各种模态框组件 -->
    <PromptModal 
      v-model:show="showPromptModal"
      :prompt="imagePrompt"
      @update:prompt="updatePrompt"
    />
    
    <SaveModal 
      v-model:show="showSaveModal"
      :initialRating="saveModalData.rating"
      :initialComment="saveModalData.comment"
      @save="saveOutfit"
      @later="saveForLater"
      @cancel="handleCancelSave"
    />
    
    <ModifyModal 
      v-model:show="showModifyModal"
      :is-submitting="isSubmittingModification"
      v-model:modify-text="modifyPlanText"
      @submit="submitModification"
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
import { ref, computed, onMounted, reactive, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import PromptModal from '@/components/modals/PromptModal.vue'
import SaveModal from '@/components/modals/SaveModal.vue'
import ModifyModal from '@/components/modals/ModifyModal.vue'
import HistoryModal from '@/components/modals/HistoryModal.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { 
  generateOutfitImage, 
  followUpOutfit, 
  saveOutfit as saveOutfitApi,
  saveOutfitComment  // 正确的函数名
} from '@/api/outfit'
import { uploadFile } from '@/api/user'
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
    const outfitResultStore = useOutfitResultStore()
    const outfitRecordStore = useOutfitRecordStore()
    
    // 改为只打印当前状态
    console.log('当前 store 状态:', {
      sceneId: outfitResultStore.sceneId,
      highlightTags: outfitResultStore.highlightTags
    })
    
    // 加载状态
    const loading = ref(false)
    const loadingMessage = ref('加载穿搭方案...')
    
    // 获取路由参数
    const scene = route.query.scene || '日常场景'
    const tags = route.query.tags ? route.query.tags.split(',').filter(Boolean) : ['日常风格']
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
    const readablePlan = computed(() => outfitResultStore.readablePlan)
    const imagePrompt = computed(() => outfitResultStore.imagePrompt)
    const summary = computed(() => outfitResultStore.summary)
    const outfitImage = computed(() => outfitResultStore.outfitImage)
    const currentVersion = computed(() => outfitResultStore.currentVersion)
    const versionHistory = computed(() => outfitResultStore.versionHistory)
    const canSave = computed(() => outfitResultStore.canSave)
    const allowSave = computed(() => outfitResultStore.allowSave)

    // 当前穿搭数据
    const outfitResult = ref({})
    // 保存状态
    const isSaved = ref(false)

    // 保存模态框数据
    const saveModalData = reactive({
      rating: 0,
      comment: '',
      title: '',
      description: '',
      tags: []
    })
    
    // 初始化保存模态框数据
    const initSaveModalData = () => {
      saveModalData.rating = 0
      saveModalData.comment = ''
    }
    
    // 修改打开保存模态框方法 - 添加防循环锁
    const saveInProgress = ref(false)
    const openSaveModal = () => {
      // 防止重复打开
      if (saveInProgress.value) {
        console.log('保存操作正在进行中...')
        return
      }
      
      // 检查是否有可保存的内容
      if (!outfitResultStore.readablePlan || !getCurrentVersionImage.value) {
        showToast('请先生成穿搭方案和效果图')
        return
      }
      
      // 初始化保存模态框数据
      initSaveModalData()
      
      // 打开模态框
      showSaveModal.value = true
    }
    
    // 修复saveOutfitRecord方法，确保正确提取和传递outfitId
    const saveOutfitRecord = async (outfitData) => {
      try {
        // 1. 获取必要信息
        const userId = userStore.userInfo?.userId
        if (!userId) {
          throw new Error('用户未登录')
        }

        // 2. 上传图片（如果有）
        let imageUrl = ''
        if (getCurrentVersionImage.value) {
          const imageBlob = await fetch(getCurrentVersionImage.value).then(r => r.blob())
          const formData = new FormData()
          formData.append('file', imageBlob, 'outfit-image.png')
          const uploadResult = await uploadFile(formData)
          // 确保使用API返回的图片URL，而不是base64
          imageUrl = uploadResult.fileUrl || uploadResult.url || ''
          
          if (!imageUrl) {
            throw new Error('图片上传失败，未返回有效URL')
          }
        }

        // 3. 构建基础保存数据
        const baseOutfitData = {
          userId,
          imageUrl, // 使用上传后的URL，不是base64
          description: outfitResultStore.currentEvaluation?.description || '',
          occasion: outfitResultStore.currentEvaluation?.occasion || '',
          styleType: outfitResultStore.currentEvaluation?.styleType || '',
          sceneId: outfitResultStore.sceneId,
          highlightTags: outfitResultStore.highlightTags
        }

        // 4. 保存穿搭记录 - 使用store方法
        const savedResult = await outfitRecordStore.saveOutfitRecord(baseOutfitData)
        console.log('保存记录API返回结果:', savedResult)
        
        // 提取outfitId - 确保正确获取message中的ID
        let outfitId = null
        if (savedResult && savedResult.outfitId) {
          // 尝试处理message，防止它是JSON字符串
          if (typeof savedResult.outfitId === 'string') {
            // 如果message是形如 "1902222351994527746" 的字符串，去掉引号
            outfitId = savedResult.outfitId.replace(/^"|"$/g, '')
          } else {
            outfitId = savedResult.outfitId
          }
          console.log('从API返回中提取的outfitId:', outfitId, '类型:', typeof outfitId)
        }
        
        // 返回保存结果
        return {
          success: true,
          outfitId: outfitId, // 使用处理后的outfitId
          imageUrl: imageUrl
        }
      } catch (error) {
        console.error('保存穿搭记录失败:', error)
        throw error
      }
    }

    // 修改稍后评价方法
    const saveForLater = async () => {
      try {
        loading.value = true
        const result = await saveOutfitRecord({})
        showToast('保存成功')
        router.push('/outfit-record')
      } catch (error) {
        showToast('保存失败: ' + error.message)
      } finally {
        loading.value = false
        saveInProgress.value = false
      }
    }

    // 修改立即评价方法，主要修复评论保存问题
    const saveOutfit = async () => {
      try {
        loading.value = true
        saveInProgress.value = true
        
        // 1. 先保存穿搭记录
        console.log('开始第一步：上传图片和保存穿搭记录')
        const saveResult = await saveOutfitRecord({})
        console.log('第一步完成，保存结果:', saveResult)
        
        // 确保outfitId正确获取，输出详细信息
        const outfitId = saveResult.outfitId
        console.log('保存记录返回的outfitId:', outfitId, '类型:', typeof outfitId)
        
        // 获取评分和评论内容
        const rating = saveModalData.rating || 0
        const comment = saveModalData.comment?.trim() || ''
        
        console.log('从saveModalData获取的评分和评论:', { 
          rating,
          hasComment: !!comment
        })
        
        // 2. 如果有评分和评价，则提交评价
        if ((rating > 0 || comment) && outfitId) {
          // 构建评价数据
          const commentData = {
            userId: userStore.userInfo?.userId,
            ipAddress: externalDataStore.locationData?.city ? 
              `${externalDataStore.locationData.province || ''} ${externalDataStore.locationData.city}` : "",
            outfitId: outfitId,
            score: rating,
            comment: comment
          }
          
          console.log('准备调用第三个接口保存评论，完整参数:', JSON.stringify(commentData))
          
          try {
            const commentResult = await saveOutfitComment(commentData)
            console.log('第三个接口调用成功:', commentResult)
          } catch (commentError) {
            console.error('保存评论失败:', commentError)
            showToast('评论保存失败，但穿搭方案已保存')
          }
        } else {
          console.log('没有评价内容或缺少outfitId，跳过第三个接口调用')
        }
        
        // 添加延迟确保接口调用完成
        await new Promise(resolve => setTimeout(resolve, 800))
        
        showToast('穿搭方案已保存')
        router.push('/outfit-record')
      } catch (error) {
        console.error('保存过程中出错:', error)
        showToast('保存失败: ' + error.message)
      } finally {
        loading.value = false
        saveInProgress.value = false
      }
    }

    // 修改generateImage方法以正确处理返回的base64数据并更新当前版本
    const generateImage = async () => {
      if (loading.value) return
      
      loading.value = true
      isGenerating.value = true
      generatingProgress.value = 0
      generatingStatus.value = "正在生成图片..."
      
      try {
        // 使用真实API生成图片
        const response = await generateOutfitImage({
          prompt: imagePrompt.value,
          userId: userStore.userInfo?.userId,
          outfitId: outfitResult.value?.id || '',
          version: currentVersion.value
        })
        
        console.log("图片生成API返回:", response)
        
        // 检查API返回的数据格式
        let imageData = response;
        if (response.data) {
          imageData = response.data;
        }
        
        // 获取图片URL或base64数据
        let imageUrl = imageData.imageUrl || imageData.url || imageData;
        
        // 格式化图片源（确保base64数据正确）
        const formattedImageUrl = formatImageSource(imageUrl);
        
        // 将图片数据存储到当前版本
        if (outfitResultStore.versionHistory.length > 0) {
          // 获取当前版本索引
          const currentIndex = outfitResultStore.currentVersionIndex;
          
          // 直接更新版本历史中的图片
          if (currentIndex >= 0 && currentIndex < outfitResultStore.versionHistory.length) {
            // 这将通过引用更新存储中的数据
            outfitResultStore.versionHistory[currentIndex].outfitImage = formattedImageUrl;
            
            // 同时更新全局图片状态以保持兼容性
            outfitResultStore.setOutfitImage(formattedImageUrl);
          }
        }
        
        // 成功提示
        showToast('图片生成成功')
      } catch (error) {
        console.error('图片生成失败:', error)
        showToast('图片生成失败，请稍后再试')
      } finally {
        loading.value = false
        isGenerating.value = false
      }
    }

    // 重新生成图片
    const regenerateImage = () => {
      if (confirm('确定要重新生成图片吗？当前图片将被替换。')) {
        generateImage()
        showToast('开始重新生成图片', 'info')
      }
    }

    // 修改下载图片方法以使用当前版本的图片
    const downloadImage = () => {
      const imageToDownload = getCurrentVersionImage.value;
      if (!imageToDownload) return;
      
      try {
        // 创建临时链接并触发下载
        const link = document.createElement('a');
        link.href = imageToDownload;
        link.download = `穿搭效果图_${currentVersion.value}_${new Date().toISOString().slice(0, 10)}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('图片已开始下载', 'success');
      } catch (error) {
        console.error('下载图片失败', error);
        showToast('下载图片失败', 'error');
      }
    }

    // 更新提示词
    const updatePrompt = (newPrompt) => {
      outfitResultStore.setAiPrompt(newPrompt)
      showPromptModal.value = false
    }

    // 修改穿搭方案
    const modifyOutfit = async (modifiedPlan) => {
      try {
        loading.value = true
        loadingMessage.value = "正在修改穿搭方案..."
        
        // 调用后端followup接口获取修改后的方案和新的提示词
        const requestData = {
          userId: userStore.userInfo?.id || '',
          ipAddress: externalDataStore.locationData?.city || '未知位置',
          editedPlan: modifiedPlan,
          previousPlan: outfitResultStore.readablePlan || '',
          additionalInfo: ''
        }
        const response = await followUpOutfit(requestData)
        const updatedPlan = response.data.readablePlan
        const updatedPrompt = response.data.imagePrompt
        const updatedSummary = response.data.summary || ''
        
        // 使用addVersion方法添加新版本，替代createNewVersion和addToVersionHistory
        outfitResultStore.addVersion({
          readablePlan: updatedPlan,
          imagePrompt: updatedPrompt,
          summary: updatedSummary
        }, '手动修改: 用户修改了穿搭方案')
        
        // 清除旧的效果图，需要用户重新生成
        outfitResultStore.setOutfitImage(null)
        
        // 关闭修改模态框
        showModifyModal.value = false
        
        // 显示成功提示
        showToast('方案已修改，请重新生成穿搭效果图', 'success')
        
      } catch (error) {
        console.error('修改穿搭方案失败', error)
        showToast('修改失败，请重试', 'error')
      } finally {
        loading.value = false
      }
    }

    // 恢复历史版本 - 简化逻辑，确保版本切换正确
    const restoreVersion = (version) => {
      if (!version) return
      
      // 在切换版本前记录当前版本
      const currentData = {
        version: currentVersion.value,
        plan: outfitResultStore.readablePlan,
        prompt: outfitResultStore.imagePrompt,
        summary: outfitResultStore.summary,
        image: outfitResultStore.outfitImage
      }
      
      // 如果当前版本有更改但未保存，先保存当前版本
      const existingVersion = outfitResultStore.versionHistory.find(v => v.version === currentVersion.value)
      if (!existingVersion || 
          existingVersion.readablePlan !== currentData.plan || 
          existingVersion.imagePrompt !== currentData.prompt) {
        
        // 使用addVersion方法而不是不存在的addToVersionHistory
        outfitResultStore.addVersion({
          readablePlan: currentData.plan,
          imagePrompt: currentData.prompt,
          summary: currentData.summary
        }, `版本 ${currentVersion.value} 自动保存`)
      }
      
      // 使用switchVersion方法恢复选择的版本
      const restored = outfitResultStore.switchVersion(version.version)
      if (restored) {
        showToast(`已恢复到版本 ${version.version}: ${version.description || '无描述'}`, 'success')
      }
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
    const openHistoryModal = () => { showHistoryModal.value = true }
    
    // 打开修改方案对话框 - 更新为更健壮的实现
    const openModifyModal = () => {
      // 确保先清空之前的输入，再打开模态框
      modifyPlanText.value = ''
      // 打开模态框
      showModifyModal.value = true
    }

    // 生命周期钩子 - 组件挂载后初始化数据
    onMounted(() => {
      console.log('OutfitResultView 挂载检查:')
      
      // 先尝试初始化数据（从会话存储恢复）
      initData().then(() => {
        console.log('数据初始化完成')
        console.log('readablePlan:', outfitResultStore.readablePlan)
        console.log('imagePrompt:', outfitResultStore.imagePrompt)
        console.log('summary:', outfitResultStore.summary)
        console.log('版本历史:', JSON.stringify(outfitResultStore.versionHistory))
        
        // 版本历史修复 - 如果版本历史中使用了旧字段名，进行修正
        if (outfitResultStore.versionHistory && outfitResultStore.versionHistory.length > 0) {
          outfitResultStore.versionHistory.forEach(version => {
            // 检查并修复字段名不一致问题
            if (version.plan && !version.readablePlan) {
              version.readablePlan = version.plan;
            }
            if (version.prompt && !version.imagePrompt) {
              version.imagePrompt = version.prompt;
            }
          });
        }
        
        // 使用正确的字段名检查数据是否存在
        if (!outfitResultStore.readablePlan) {
          console.error('穿搭推荐数据不存在，返回推荐页面')
          router.push('/dress-recommend')
        } else {
          console.log('成功加载穿搭推荐数据')
        }
        
        // 启用数据监听，确保状态变化时自动保存到sessionStorage
        outfitResultStore.watchData()
      }).catch(error => {
        console.error('初始化数据失败:', error)
        router.push('/dress-recommend')
      })
    })

    // 监听路由变化，在离开页面时清除数据
    onBeforeRouteLeave((to, from, next) => {
      // 无条件清除数据，确保不会留下残留
      outfitResultStore.resetAll()
      console.log('离开页面，已清空穿搭结果数据')
      
      // 清除 sessionStorage 中的数据
      sessionStorage.removeItem('outfitResultData')
      
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

    // 更新现有的saveToRecord方法（仅打开模态框，不直接保存）
    const saveToRecord = () => {
      openSaveModal()
    }

    // 修改getImagePath方法
    const getImagePath = (outfit) => {
      // 增加防御性检查，确保outfit存在
      if (!outfit) {
        return formatImageSource(outfitImage.value || ''); // 使用格式化后的图片或空字符串
      }
      
      // 获取图片路径并进行格式化
      const imageSrc = outfit.imagePath || outfit.url || outfit.fileUrl || '';
      return formatImageSource(imageSrc);
    }

    // 修改方案相关
    const modifyPlanText = ref('') // 存储用户的修改请求
    const isSubmittingModification = ref(false) // 提交修改的加载状态

    // 提交修改方案请求 - 优化错误处理和用户体验
    const submitModification = async () => {
      // 验证输入不为空
      if (!modifyPlanText.value.trim()) {
        showToast('请输入您的修改意见', 'warning')
        return
      }
      
      // 防止重复提交
      if (isSubmittingModification.value) {
        return
      }
      
      isSubmittingModification.value = true
      
      try {
        // 准备发送到API的数据
        const modificationData = {
          userId: userStore.userInfo?.userId || '',
          ipAddress: externalDataStore.locationData?.city ? 
            `${externalDataStore.locationData.province || ''} ${externalDataStore.locationData.city}` : "",
          editedPlan: modifyPlanText.value, // 用户输入的修改意见
          previousPlan: readablePlan.value || '', // 当前的穿搭方案
          additionalInfo: summary.value || '' // 方案摘要作为附加信息
        }
        
        console.log('发送穿搭方案修改请求:', modificationData)
        
        // 调用API获取新方案
        const response = await followUpOutfit(modificationData)
        
        // 打印完整的响应以便调试
        console.log('API响应数据:', response)
        
        // 更灵活地处理API返回的数据结构
        let responseData = response
        
        // 检查response.data是否存在，如果存在就使用它
        if (response && response.data) {
          responseData = response.data
        }
        
        // 分别获取所需的字段，提供默认值以防字段不存在
        const newReadablePlan = responseData.readablePlan || responseData.outfitDescription || responseData.plan || ''
        const newImagePrompt = responseData.imagePrompt || responseData.prompt || responseData.aiPromptDescription || ''
        const newSummary = responseData.summary || responseData.description || ''
        
        if (!newReadablePlan) {
          console.warn('API返回数据中没有找到有效的穿搭方案')
        }
        
        // 使用outfitResultStore中的addVersion方法更新版本
        outfitResultStore.addVersion({
          readablePlan: newReadablePlan, 
          imagePrompt: newImagePrompt,
          summary: newSummary
        }, modifyPlanText.value)
        
        // 清除旧的效果图
        outfitResultStore.setOutfitImage(null)
        
        // 关闭修改对话框
        showModifyModal.value = false
        
        // 成功提示
        showToast('穿搭方案已更新，您可以重新生成效果图', 'success')
      } catch (error) {
        console.error('修改方案失败:', error)
        // 提供更详细的错误信息
        showToast(`修改方案失败: ${error.message || '请稍后再试'}`, 'error')
      } finally {
        isSubmittingModification.value = false
      }
    }

    // 优化formatImageSource方法以适应更多base64格式
    const formatImageSource = (imageData) => {
      if (!imageData) return '';
      
      // 如果是字符串类型进行处理
      if (typeof imageData === 'string') {
        // 已经是完整的data:image格式
        if (imageData.startsWith('data:image')) {
          return imageData;
        }
        
        // 是纯base64字符串但没有前缀 - 扩展识别更多base64开头模式
        const base64Patterns = ['/9j/', 'iVBOR', 'PHN2Z', 'R0lGOD', 'PD94', 'Qk0', 'SUkqA', 'TU0A'];
        for (const pattern of base64Patterns) {
          if (imageData.startsWith(pattern)) {
            console.log("检测到base64图片，添加前缀");
            return `data:image/jpeg;base64,${imageData}`;
          }
        }
        
        // 如果包含base64关键字但格式不完整
        if (imageData.includes('base64,') && !imageData.startsWith('data:')) {
          console.log("检测到不完整的base64格式，修复前缀");
          return `data:image/jpeg;base64,${imageData.split('base64,')[1]}`;
        }
        
        // 如果是普通URL，直接返回
        return imageData;
      }
      
      // 如果是对象类型，尝试获取URL属性
      if (typeof imageData === 'object' && imageData !== null) {
        const url = imageData.url || imageData.imageUrl || imageData.src || '';
        return formatImageSource(url); // 递归处理找到的URL
      }
      
      // 默认返回空字符串
      return '';
    }

    // 添加调试方法，在控制台查看图片数据
    const debugImageData = () => {
      console.log("当前图片数据:", outfitImage.value);
      console.log("格式化后:", formatImageSource(outfitImage.value));
      
      // 检查是否为base64格式
      if (typeof outfitImage.value === 'string' && outfitImage.value.length > 100) {
        console.log("看起来是base64数据，长度:", outfitImage.value.length);
        console.log("前20个字符:", outfitImage.value.substring(0, 20));
      }
    }

    // 获取当前版本的图片或全局图片
    const getCurrentVersionImage = computed(() => {
      if (outfitResultStore.versionHistory.length === 0) return '';
      
      const currentVersionIndex = outfitResultStore.currentVersionIndex;
      const currentVersion = outfitResultStore.versionHistory[currentVersionIndex];
      
      // 优先返回版本中存储的图片
      if (currentVersion && currentVersion.outfitImage) {
        return formatImageSource(currentVersion.outfitImage);
      }
      
      // 如果版本中没有图片，回退到全局图片
      return formatImageSource(outfitImage.value || '');
    });

    // 添加取消保存的处理方法
    const handleCancelSave = () => {
      // 重置状态
      showSaveModal.value = false
      saveInProgress.value = false
      
      console.log('用户取消了保存操作')
    }

    return {
      // 使用computed引用store的状态
      readablePlan,
      imagePrompt,
      summary,
      outfitImage,
      currentVersion,
      versionHistory,
      canSave,
      allowSave,
      
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
      saveToRecord,
      getImagePath,
      
      // 修改方案相关
      modifyPlanText,
      isSubmittingModification,
      submitModification,
      
      // 新增的formatImageSource方法
      formatImageSource,
      
      // 新增的debugImageData方法
      debugImageData,
      
      // 新增的getCurrentVersionImage方法
      getCurrentVersionImage,
      
      // 新增的handleCancelSave方法
      handleCancelSave
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

/* Markdown样式 */
.markdown-body {
  line-height: 1.6;
  color: #24292e;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 { font-size: 1.8em; }
.markdown-body h2 { font-size: 1.5em; }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }

.markdown-body p {
  margin-top: 0;
  margin-bottom: 1em;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-body li {
  margin-bottom: 0.25em;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 1em 0;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 1em;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

/* 底部安全区域适配 - 尤其是对iPhone刘海屏等设备 */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

/* 按钮阴影美化 */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 