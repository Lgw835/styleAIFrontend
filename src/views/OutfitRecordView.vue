<template>
  <div class="outfit-record">
    <!-- 内联导航栏替代 SubPageNavBar 组件 -->
    <div class="sticky top-0 left-0 right-0 bg-white shadow-sm z-20">
      <div class="container mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center">
          <router-link to="/" class="text-gray-500 mr-4">
            <i class="fas fa-chevron-left"></i>
          </router-link>
          <h1 class="text-lg font-medium">推荐记录</h1>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 加载指示器 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
      
      <div v-else class="px-4">
        <!-- 瀑布流式推荐记录列表 -->
        <template v-if="outfits.length > 0">
          <div class="waterfall-container">
            <div 
              v-for="outfit in outfits" 
              :key="outfit.id" 
              class="waterfall-item"
              :data-outfit-id="outfit.id"
            >
              <!-- 卡片主体内容，点击打开详情 -->
              <div class="outfit-card" @click="openDetail(outfit)">
                <!-- 图片 -->
                <img 
                  :src="outfit.outfitImageUrl || outfit.outfitImage || outfit.imageUrl" 
                  class="w-full object-cover rounded-t-lg" 
                  alt="穿搭效果图"
                  @error="handleImageError($event)"
                >
                
                <!-- 简要信息 -->
                <div class="p-2 flex justify-between items-center">
                  <div class="text-xs text-gray-500">{{ formatDate(outfit.createdAt || outfit.createTime) }}</div>
                  <div class="score-badge">{{ isOutfitRated(outfit) ? `评分 ${outfit.score}` : '未评价' }}</div>
                </div>
              </div>
              
              <!-- 更多操作按钮 -->
              <button 
                class="more-options-btn"
                @click.stop="toggleMenu(outfit.id)"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
              
              <!-- 操作菜单 -->
              <div 
                class="action-menu" 
                :class="{ active: activeMenu === outfit.id }"
              >
                <div 
                  class="action-menu-item delete"
                  @click.stop="deleteOutfit(outfit.id)"
                >
                  <i class="fas fa-trash"></i> 删除记录
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 空状态展示 -->
        <template v-else>
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-inbox text-4xl mb-3"></i>
            <p>暂无穿搭推荐记录</p>
          </div>
        </template>
      </div>
    </div>

    <!-- 穿搭详情模态框 -->
    <div class="modal" :class="{ active: showDetailModal }">
      <div class="modal-content">
        <!-- 模态框头部 -->
        <div class="p-4 border-b sticky top-0 bg-white z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">穿搭详情</h2>
            <button @click="closeDetail" class="text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- 穿搭详情内容 -->
        <div class="p-4" v-if="currentOutfit">
          <div class="mb-6">
            <!-- 基本信息 -->
            <div class="mb-4">
              <div class="flex justify-between items-center mt-1">
                <p class="text-sm text-gray-500">{{ formatDate((currentOutfit?.createTime || currentOutfit?.createdAt) || '') }}</p>
                <div class="score-badge">{{ currentOutfit && isOutfitRated(currentOutfit) ? `评分 ${currentOutfit.score}` : '未评价' }}</div>
              </div>
            </div>

            <!-- 图片 -->
            <div class="w-full mb-4">
              <img 
                :src="currentOutfit.outfitImageUrl || currentOutfit.outfitImage || currentOutfit.imageUrl" 
                class="w-full h-auto rounded-lg" 
                alt="穿搭效果图"
              >
            </div>

            <!-- AI描述 - 简化版 -->
            <div class="bg-[#F8F9FA] rounded-lg p-4 mb-4">
              <div class="text-sm text-gray-500 mb-2">AI 生成描述</div>
              <div class="text-gray-700">{{ currentOutfit.aiPromptDescription || currentOutfit.aiDescription }}</div>
            </div>

            <!-- 基本穿搭描述 -->
            <div class="mb-4">
              <div class="font-medium mb-2">穿搭描述</div>
              <!-- 使用 Markdown 渲染组件 -->
              <MarkdownRenderer 
                :markdown="getOutfitDescriptionMarkdown(currentOutfit)" 
                class="prose prose-sm text-gray-700 max-w-full"
              />
            </div>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="border-t p-4">
          <h3 class="text-base font-medium mb-3">我的评价</h3>

          <!-- 加载评价中 -->
          <div v-if="loadingEvaluation" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
          </div>

          <!-- 评价显示区域 -->
          <div v-else class="mb-4">
            <template v-if="currentOutfit && isOutfitRated(currentOutfit)">
              <div>
                <!-- 评分星星 -->
                <div class="flex mb-4 justify-center">
                  <i 
                    v-for="n in 5" 
                    :key="n"
                    class="fas fa-star text-2xl mx-1"
                    :class="n <= (currentOutfit?.score || 0) ? 'text-yellow-400' : 'text-gray-300'"
                  ></i>
                </div>

                <!-- 评价内容 -->
                <div class="bg-gray-50 rounded-lg p-4 mb-3">
                  {{ currentOutfit?.comment || '无评价内容' }}
                </div>

              </div>
            </template>
            
            <!-- 提示用户评价 -->
            <div v-else-if="!showEvaluationForm" class="text-center py-4">
              <p class="text-gray-500 mb-4">您尚未对此穿搭进行评价</p>
              <button 
                @click="startEditEvaluation" 
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                立即评价
              </button>
            </div>
            
            <!-- 评价表单 -->
            <div v-else>
              <form @submit.prevent="submitEvaluationForm">
                <!-- 评分星星 -->
                <div class="flex mb-6 justify-center">
                  <div class="rating">
                    <div 
                      v-for="n in 5" 
                      :key="n" 
                      class="star-container"
                      @click="updateRating(n)"
                    >
                      <i class="fas fa-star text-2xl" :class="newEvaluation.score >= n ? 'text-yellow-400' : 'text-gray-300'"></i>
                    </div>
                  </div>
                </div>
                    
                <!-- 评价内容 -->
                <div class="mb-6">
                  <textarea 
                    v-model="newEvaluation.comment" 
                    class="w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
                    placeholder="分享您对这套穿搭的看法..."
                    rows="4"
                  ></textarea>
                </div>
                
                <!-- 提交按钮 -->
                <div class="flex justify-end space-x-3">
                  <button 
                    type="button"
                    @click="showEvaluationForm = false" 
                    class="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-150 text-sm font-medium"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    class="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 text-sm font-medium"
                    :disabled="submittingEvaluation"
                  >
                    {{ submittingEvaluation ? '提交中...' : '提交评价' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOutfitRecordStore } from '@/stores/outfitRecord'
import { useExternalDataStore } from '@/stores/externalData'
import { showToast } from 'vant'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

// 用户store
const userStore = useUserStore()
const outfitRecordStore = useOutfitRecordStore()
const externalDataStore = useExternalDataStore()
const router = useRouter()

// 状态变量
const loading = computed(() => outfitRecordStore.loading)
const outfits = computed(() => outfitRecordStore.outfits)
const currentOutfit = computed(() => outfitRecordStore.currentOutfit)
const currentEvaluation = computed(() => outfitRecordStore.currentEvaluation)
const activeMenu = ref(null)
const showDetailModal = ref(false)
const newRating = ref(0)
const newComment = ref('')
const submittingEvaluation = ref(false)
const loadingEvaluation = ref(false)
const refreshTimer = ref(null)
const showEvaluationForm = ref(false)
const newEvaluation = ref({ score: 0, comment: '' })

// 打开详情模态框
const openDetail = async (outfit) => {
  // 设置当前查看的穿搭
  outfitRecordStore.setCurrentOutfit(outfit)
  
  // 显示模态框
  showDetailModal.value = true
  
  loadingEvaluation.value = true
  
  // 尝试获取详细信息和评价
  try {
    await outfitRecordStore.fetchOutfitDetail(outfit.id)
    await outfitRecordStore.fetchOutfitEvaluation(outfit.id)
  } catch (error) {
    console.error('获取详情失败', error)
    showToast('获取详情失败，请重试')
  } finally {
    loadingEvaluation.value = false
  }
}

// 关闭详情模态框
const closeDetail = () => {
  showDetailModal.value = false
  outfitRecordStore.clearCurrentOutfit()
  
  // 重置评价表单
  newRating.value = 0
  newComment.value = ''
}

// 切换操作菜单
const toggleMenu = (outfitId) => {
  if (activeMenu.value === outfitId) {
    activeMenu.value = null
  } else {
    activeMenu.value = outfitId
  }
}

// 删除记录
const deleteOutfit = async (outfitId) => {
  if (confirm('确定要删除这条穿搭记录吗？')) {
    // 关闭操作菜单
    activeMenu.value = null
    
    try {
      // 调用真实API删除记录
      const success = await outfitRecordStore.deleteOutfit(outfitId)
      
      // 如果正在查看这条记录，关闭详情
      if (success && showDetailModal.value && currentOutfit.value?.id === outfitId) {
        closeDetail()
      }
      
      showToast('穿搭记录已删除')
    } catch (error) {
      console.error('删除记录失败', error)
      showToast('删除失败，请稍后再试')
    }
  }
}

// 开始编辑评价
const startEditEvaluation = () => {
  // 检查是否已评价，使用统一的判断逻辑
  if (currentOutfit.value && isOutfitRated(currentOutfit.value)) {
    showToast('已经评价过此穿搭')
    return
  }
  
  showEvaluationForm.value = true
  // 设置初始评分为0（未选择状态）
  newEvaluation.value.score = 0
  newEvaluation.value.comment = ''
}

// 更新评分
const updateRating = (value) => {
  newEvaluation.value.score = value
}

// 提交评价表单
const submitEvaluationForm = async () => {
  // 验证表单
  if (!newEvaluation.value.score || newEvaluation.value.score === 0) {
    showToast('请为此穿搭评分')
    return
  }
  
  submittingEvaluation.value = true
  
  try {
    const requestData = {
      userId: userStore.userInfo?.id || '',
      ipAddress: externalDataStore.locationData.city || '未知位置',
      outfitId: currentOutfit.value.id,
      score: newEvaluation.value.score,
      comment: newEvaluation.value.comment || ''
    }
    
    // 调用真实API保存评价
    await outfitRecordStore.saveOutfitEvaluation(requestData)
    
    // 更新本地数据（通过Store的方法）
    const updatedOutfit = {
      ...currentOutfit.value,
      score: newEvaluation.value.score,
      comment: newEvaluation.value.comment
    }
    
    // 更新当前穿搭
    outfitRecordStore.setCurrentOutfit(updatedOutfit)
    
    // 清除表单并关闭
    showEvaluationForm.value = false
    showToast('评价已提交')
    
  } catch (error) {
    console.error('提交评价失败', error)
    showToast('提交失败，请稍后再试')
  } finally {
    submittingEvaluation.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 主动刷新数据的方法
const refreshOutfits = async () => {
  try {
    if (!userStore.isLoggedIn || !userStore.userInfo?.id) {
      return false
    }
    
    const userId = userStore.userInfo.id
    await outfitRecordStore.fetchOutfitRecords(userId, true)
    return true
  } catch (error) {
    console.error('刷新数据失败', error)
    return false
  }
}

// 设置定时刷新
const setupRefreshTimer = () => {
  // 清除已有的定时器
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
  
  // 每60秒检查一次是否需要刷新数据
  refreshTimer.value = setInterval(() => {
    if (outfitRecordStore.needRefresh) {
      refreshOutfits()
    }
  }, 60000)
}

// 页面加载时获取数据
onMounted(async () => {
  console.log('初始化穿搭记录数据')
  
  // 先尝试从本地存储恢复数据
  const restored = outfitRecordStore.restoreFromStorage()
  
  // 如果本地没有数据或数据为空，从API获取
  if (!restored || outfitRecordStore.records.length === 0) {
    if (userStore.isLoggedIn) {
      await outfitRecordStore.fetchRecords()
    }
  }
})

// 监听穿搭记录变化，保持数据实时更新
watch(() => outfitRecordStore.outfits, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // 更新视图
    console.log('穿搭记录已更新')
  }
})

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
})

// 初始化数据
const fetchOutfits = async () => {
  try {
    // 使用更可靠的方式检查用户是否登录
    if (!userStore.isLoggedIn) {
      console.error('用户未登录 (isLoggedIn 检查)')
      showToast('请先登录')
      return
    }
    
    // 对 userInfo 进行更严格的检查
    if (!userStore.userInfo) {
      console.error('用户信息不存在')
      showToast('获取用户信息失败')
      return
    }
    
    // 尝试多种方式获取用户ID
    const userId = userStore.userInfo.id || userStore.userInfo.userId || userStore.userId
    
    if (!userId) {
      console.error('找不到用户ID')
      showToast('用户ID不存在')
      return
    }
    
    console.log('使用用户ID:', userId)
    
    // 获取穿搭记录
    await outfitRecordStore.fetchOutfitRecords(userId)
  } catch (error) {
    console.error('获取穿搭记录失败', error)
    showToast('获取记录失败，请检查网络连接')
  }
}

// 获取穿搭描述的 Markdown 格式
const getOutfitDescriptionMarkdown = (outfit) => {
  if (!outfit) return ''
  
  // 处理转义序列为真实换行符的辅助函数
  const processText = (text) => {
    if (!text) return '';
    
    // 移除开头和结尾的双引号
    let processedText = text;
    if (processedText.startsWith('"') && processedText.endsWith('"')) {
      processedText = processedText.substring(1, processedText.length - 1);
    }
    
    // 将 \n\n 转换为实际的换行符
    return processedText.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
  };
  
  // 尝试处理不同类型的描述字段
  // 如果有outfitDescription字段，直接返回
  if (outfit.outfitDescription) {
    // 尝试检测是否是JSON字符串
    if (typeof outfit.outfitDescription === 'string' && outfit.outfitDescription.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(outfit.outfitDescription)
        if (parsed.readablePlan) {
          return processText(parsed.readablePlan);
        } else if (parsed.description) {
          return processText(parsed.description);
        }
      } catch (e) {
        // 如果解析失败，则当作普通文本返回
      }
    }
    
    // 非JSON或解析失败，直接返回文本内容
    return processText(outfit.outfitDescription);
  }
  
  // 检查其他可能包含描述的字段
  if (outfit.readablePlan) {
    return processText(outfit.readablePlan);
  }
  
  // 兼容旧的数据结构处理
  if (outfit.outfitData) {
    if (typeof outfit.outfitData === 'string') {
      try {
        const data = JSON.parse(outfit.outfitData)
        if (data.readablePlan) return processText(data.readablePlan);
        if (data.description) return processText(data.description);
      } catch (e) {
        console.error('解析穿搭数据失败', e)
      }
    } else if (typeof outfit.outfitData === 'object') {
      return processText(outfit.outfitData.readablePlan || outfit.outfitData.description || '');
    }
  }
  
  // 最后尝试直接返回description字段
  return processText(outfit.description || outfit.requirementText || '暂无穿搭描述');
}

// 以下是不再需要的方法，但保留以保证代码完整性
// 获取穿搭标题（兼容新旧数据结构）
const getOutfitTitle = (outfit) => {
  // 如果有标题则使用，否则使用场景ID构建标题
  if (outfit.title) {
    return outfit.title
  }
  
  // 根据场景ID构建标题
  const sceneName = getSceneName(outfit.sceneId || '')
  return `${sceneName}穿搭推荐`
}

// 从场景ID获取场景名称
const getSceneName = (sceneId) => {
  const sceneMap = {
    '商务正式': '商务',
    '休闲日常': '休闲',
    '约会': '约会',
    '运动': '运动',
    '派对': '派对'
  }
  return sceneMap[sceneId] || sceneId || '日常'
}

// 获取穿搭描述（兼容新旧数据结构）
const getOutfitDescription = (outfit) => {
  // 如果有现成的描述则使用
  if (outfit.description) {
    return outfit.description
  }
  
  // 如果有 requirementText 则使用
  if (outfit.requirementText) {
    return outfit.requirementText
  }
  
  // 尝试从 outfitDescription 解析描述
  try {
    if (outfit.outfitDescription) {
      const parsedData = JSON.parse(outfit.outfitDescription)
      if (typeof parsedData === 'string') {
        return parsedData
      } else if (parsedData.summary) {
        return parsedData.summary
      }
    }
  } catch (e) {
    console.error('解析穿搭描述失败', e)
  }
  
  // 默认描述
  return '基于场景的穿搭推荐方案'
}

// 获取穿搭标签（兼容新旧数据结构）
const getOutfitTags = (outfit) => {
  // 如果有tags数组则使用
  if (outfit.tags && Array.isArray(outfit.tags)) {
    return outfit.tags
  }
  
  // 从场景ID创建标签
  const tags = []
  if (outfit.sceneId) {
    tags.push(getSceneName(outfit.sceneId))
  }
  
  // 添加默认标签
  if (tags.length === 0) {
    tags.push('时尚', '推荐')
  }
  
  return tags
}

// 获取穿搭要点（兼容新旧数据结构）
const getOutfitKeyPoints = (outfit) => {
  // 如果有现成的要点则使用
  if (outfit.outfitData && outfit.outfitData.keyPoints) {
    return outfit.outfitData.keyPoints
  }
  
  // 尝试从 outfitDescription 解析要点
  try {
    if (outfit.outfitDescription) {
      const parsedData = JSON.parse(outfit.outfitDescription)
      if (parsedData.keyPoints && Array.isArray(parsedData.keyPoints)) {
        return parsedData.keyPoints
      }
    }
  } catch (e) {
    console.error('解析穿搭要点失败', e)
  }
  
  return []
}

// 处理图片加载失败
const handleImageError = (event) => {
  // 使用默认图片替代加载失败的图片
  event.target.src = 'https://via.placeholder.com/200x250?text=穿搭图片'
}

// 判断穿搭是否已被评价
const isOutfitRated = (outfit) => {
  if (!outfit) return false;
  // 1. 评分必须大于0
  // 2. 评论内容可以为空，但如果存在则必须有内容
  return (outfit.score > 0) || (outfit.comment && outfit.comment.trim().length > 0);
}
</script>

<style scoped>
.outfit-record {
  padding-top: 0;
}

.content-container {
  height: calc(100vh - 56px);
  overflow-y: auto;
  padding-top: 16px;
}

.content-container::-webkit-scrollbar {
  width: 4px;
}

.content-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

/* 瀑布流布局 */
.waterfall-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-bottom: 16px;
}

@media (min-width: 768px) {
  .waterfall-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .waterfall-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.waterfall-item {
  position: relative;
  break-inside: avoid;
  margin-bottom: 12px;
}

.outfit-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
}

.outfit-card:active {
  transform: scale(0.98);
}

.outfit-card img {
  height: 160px;
  width: 100%;
  object-fit: cover;
}

.score-badge {
  background: rgba(64, 150, 255, 0.1);
  color: #4096FF;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.tag {
  background: #F5F5F5;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.more-options-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.more-options-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-menu {
  position: absolute;
  top: 40px;
  right: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  overflow: hidden;
  display: none;
  width: 110px;
}

.action-menu.active {
  display: block;
}

.action-menu-item {
  padding: 12px;
  display: flex;
  align-items: center;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.action-menu-item i {
  margin-right: 8px;
  font-size: 14px;
}

.action-menu-item.delete {
  color: #ff4d4f;
}

.action-menu-item:active {
  background-color: #f5f5f5;
}

/* 模态框样式保持不变 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: none;
  z-index: 50;
  overflow-y: auto;
}

.modal.active {
  display: block;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  margin: 20px auto;
  max-height: 90vh;
  overflow-y: auto;
}

/* 评分组件样式保持不变 */
.rating {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.star-container {
  cursor: pointer;
  padding: 4px;
  transition: transform 0.15s ease-in-out;
}

.star-container:hover {
  transform: scale(1.15);
}

.star-container i {
  transition: color 0.15s ease;
}
</style> 