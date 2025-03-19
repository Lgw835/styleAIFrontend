import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import mitt from 'mitt'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { useOutfitResultStore } from '@/stores/outfitResult'
// 导入统一的API
import { 
  getOutfitRecords, 
  getOutfitDetail, 
  saveOutfitComment, 
  deleteOutfitRecord,
  evaluateOutfit,
  saveOutfit
} from '@/api/outfit'

// 创建一个简单的事件发射器
const emitter = mitt()

// sessionStorage 键名
const SESSION_STORAGE_KEY = 'outfit_records_data'

export const useOutfitRecordStore = defineStore('outfitRecord', () => {
  // 状态
  const outfits = ref([])
  const loading = ref(false)
  const lastFetchTime = ref(null)
  const currentOutfit = ref(null)
  const currentEvaluation = ref(null)

  // 检查是否需要刷新数据
  const needRefresh = computed(() => {
    if (!lastFetchTime.value) return true
    const now = new Date().getTime()
    const thirtyMinutes = 30 * 60 * 1000
    return now - lastFetchTime.value > thirtyMinutes
  })

  // 初始化函数 - 这个函数在 App.vue 中被调用
  const initStore = () => {
    console.log('初始化穿搭记录 store')
    // 从 session storage 加载数据
    loadFromSession()
    return true
  }

  // 从 Session Storage加载数据
  const loadFromSession = () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY))
      if (sessionData) {
        outfits.value = sessionData.outfits || []
        lastFetchTime.value = sessionData.lastFetchTime || null
        console.log('从 session storage 加载穿搭记录成功，数量:', outfits.value.length)
        return true
      }
    } catch (e) {
      console.error('从 Session Storage 加载穿搭记录失败:', e)
    }
    return false
  }

  // 保存数据到Session Storage
  const saveToSession = () => {
    try {
      const dataToSave = {
        outfits: outfits.value,
        lastFetchTime: lastFetchTime.value
      }
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave))
      console.log('保存穿搭记录到 session storage 成功')
      return true
    } catch (e) {
      console.error('保存穿搭记录到 Session Storage 失败:', e)
      return false
    }
  }

  // 获取穿搭记录
  const fetchOutfitRecords = async (userId, params = {}) => {
    try {
      const userStore = useUserStore()
      const actualUserId = userId || userStore.userInfo?.userId
      
      if (!actualUserId) {
        throw new Error('用户未登录')
      }
      
      // 使用分页参数调用 API
      const response = await getOutfitRecords(actualUserId, {
        page: params.page || 1,
        pageSize: params.pageSize || 6
      })
      
      if (response && Array.isArray(response)) {
        // 如果是第一页，更新 lastFetchTime
        if (params.page === 1) {
          lastFetchTime.value = Date.now()
        }
        return response
      } else if (response && Array.isArray(response.data)) {
        if (params.page === 1) {
          lastFetchTime.value = Date.now()
        }
        return response.data
      } else {
        console.warn('API返回格式异常:', response)
        return []
      }
    } catch (error) {
      console.error('获取穿搭记录失败:', error)
      return []
    }
  }

  // 获取穿搭详情
  const fetchOutfitDetail = async (outfitId) => {
    try {
      // 从本地数据中查找，使用新的 outfitId 字段
      const outfit = outfits.value.find(o => o.outfitId === outfitId)
      
      if (outfit) {
        currentOutfit.value = outfit
        return outfit
      }
      
      // 如果本地没有，尝试从API获取
      const response = await getOutfitDetail(outfitId)
      if (response && response.data) {
        currentOutfit.value = response.data
        return response.data
      }
      
      throw new Error('未找到穿搭详情')
    } catch (error) {
      console.error('获取穿搭详情失败', error)
      throw error
    }
  }

  // 获取穿搭评价
  const fetchOutfitEvaluation = async (outfitId) => {
    try {
      const userStore = useUserStore()
      const response = await evaluateOutfit({
        userId: userStore.userInfo?.userId,
        outfitId: outfitId,
        ipAddress: ''
      })
      
      if (response && response.data) {
        currentEvaluation.value = response.data
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('获取穿搭评价失败', error)
      return null
    }
  }

  // 提交评价
  const submitEvaluation = async (evaluationData) => {
    try {
      console.log('提交评价数据:', evaluationData)
      const response = await saveOutfitComment(evaluationData)
      
      // 更新本地数据
      if (currentOutfit.value && currentOutfit.value.id === evaluationData.outfitId) {
        currentOutfit.value = {
          ...currentOutfit.value,
          score: evaluationData.score,
          comment: evaluationData.comment
        }
      }
      
      // 更新列表中的数据
      const index = outfits.value.findIndex(o => o.id === evaluationData.outfitId)
      if (index !== -1) {
        outfits.value[index] = {
          ...outfits.value[index],
          score: evaluationData.score,
          comment: evaluationData.comment
        }
        saveToSession()
      }
      
      return response
    } catch (error) {
      console.error('提交评价失败', error)
      throw error
    }
  }

  // 删除穿搭
  const deleteOutfit = async (outfitId) => {
    try {
      await deleteOutfitRecord(outfitId)
      
      // 使用新的 outfitId 字段过滤
      outfits.value = outfits.value.filter(o => o.outfitId !== outfitId)
      if (currentOutfit.value?.outfitId === outfitId) {
        currentOutfit.value = null
      }
      
      saveToSession()
      return true
    } catch (error) {
      console.error('删除穿搭失败，但会继续更新本地数据:', error)
      
      // 使用新的 outfitId 字段过滤
      outfits.value = outfits.value.filter(o => o.outfitId !== outfitId)
      if (currentOutfit.value?.outfitId === outfitId) {
        currentOutfit.value = null
      }
      
      saveToSession()
      return true
    }
  }

  // 设置当前查看的穿搭
  const setCurrentOutfit = (outfit) => {
    currentOutfit.value = outfit
  }

  // 清空当前查看的穿搭
  const clearCurrentOutfit = () => {
    currentOutfit.value = null
    currentEvaluation.value = null
  }

  // 完全重构保存穿搭记录的方法
  const saveOutfitRecord = async (outfitData) => {
    loading.value = true
    
    try {
      console.log('准备保存穿搭记录:', outfitData)
      
      // 获取 outfitResultStore 中的数据
      const outfitResultStore = useOutfitResultStore()
      
      // 从外部获取可能的IP地址信息
      let ipAddress = ''
      try {
        const externalDataStore = useExternalDataStore()
        ipAddress = externalDataStore?.locationData?.city 
          ? `${externalDataStore.locationData.province || ''} ${externalDataStore.locationData.city}`
          : '上海市'
      } catch (e) {
        console.warn('获取位置信息失败:', e)
        ipAddress = '上海市' // 默认值
      }
      
      // 构建请求参数
      const requestParams = {
        userId: outfitData.userId || '',
        ipAddress: ipAddress,
        outfitDescription: outfitResultStore.currentEvaluation?.description || 
                          outfitResultStore.readablePlan || 
                          '个人日常穿搭',
        aiPromptDescription: outfitResultStore.imagePrompt || 
                            outfitResultStore.currentEvaluation?.styleType || 
                            '简约时尚风格',
        outfitImageUrl: outfitData.imageUrl || outfitResultStore.outfitImage || '',
        requirementText: outfitResultStore.summary || '日常穿着需求',
        sceneId: outfitResultStore.sceneId || outfitData.sceneId || '日常场景',
        highlightImageUrl: outfitResultStore.highlightTags || outfitData.highlightTags || '日常风格'
      }
      
      console.log('调用保存接口，参数:', requestParams)
      
      // 调用保存接口
      const response = await saveOutfit(requestParams)
      console.log('保存接口完整响应:', response)
      
      if (response && response.success) {
        // 关键改进：直接从message字段获取outfitId
        const outfitId = response.message
        console.log('保存成功，获取到的outfitId:', outfitId)
        
        // 添加到本地数据，使用新的字段格式
        const newRecord = {
          outfitId: outfitId,
          userId: outfitData.userId,
          outfitDescription: requestParams.outfitDescription,
          aiPromptDescription: requestParams.aiPromptDescription,
          outfitImageUrl: requestParams.outfitImageUrl,
          date: new Date().toISOString(),
          requirementText: requestParams.requirementText,
          sceneId: requestParams.sceneId,
          highlightImageUrl: requestParams.highlightImageUrl,
          ifEvaluate: 0,
          evaluationId: null,
          evaluationText: null,
          rating: null,
          createdAt: null
        }
        
        // 添加到数组开头
        outfits.value.unshift(newRecord)
        saveToSession()
        
        // 返回包含outfitId的结果
        return {
          success: true,
          outfitId: outfitId,
          outfitImageUrl: requestParams.outfitImageUrl,
          record: newRecord
        }
      } else {
        throw new Error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('保存穿搭记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    outfits,
    loading,
    lastFetchTime,
    currentOutfit,
    currentEvaluation,
    needRefresh,
    
    // 方法
    initStore,
    fetchOutfitRecords,
    fetchOutfitDetail,
    fetchOutfitEvaluation,
    submitEvaluation,
    deleteOutfit,
    setCurrentOutfit,
    clearCurrentOutfit,
    loadFromSession,
    saveToSession,
    saveOutfitRecord
  }
}) 