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
  const fetchOutfitRecords = async (userId, forceRefresh = false) => {
    // 如果不强制刷新且有本地数据，使用本地数据
    if (!forceRefresh && outfits.value.length > 0) {
      return outfits.value
    }
    
    loading.value = true
    
    try {
      const userStore = useUserStore()
      const actualUserId = userId || userStore.userInfo?.id
      
      if (!actualUserId) {
        throw new Error('用户未登录')
      }
      
      const response = await getOutfitRecords(actualUserId)
      
      if (response && response.data) {
        outfits.value = response.data
        // 保存到 Session Storage
        saveToSession()
        return outfits.value
      } else {
        throw new Error('获取数据格式错误')
      }
    } catch (error) {
      console.error('获取穿搭记录失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  // 获取穿搭详情
  const fetchOutfitDetail = async (outfitId) => {
    try {
      const response = await getOutfitDetail(outfitId)
      currentOutfit.value = response.data
      return response.data
    } catch (error) {
      console.error('获取穿搭详情失败', error)
      throw error
    }
  }

  // 获取穿搭评价
  const fetchOutfitEvaluation = async (outfitId, userId) => {
    try {
      const response = await evaluateOutfit({
        outfitId,
        userId
      })
      currentEvaluation.value = response.data
      return response.data
    } catch (error) {
      console.error('获取穿搭评价失败', error)
      throw error
    }
  }

  // 提交评价
  const submitEvaluation = async (evaluationData) => {
    try {
      await saveOutfitComment(evaluationData)
      // 更新本地数据
      if (currentOutfit.value && currentOutfit.value.id === evaluationData.outfitId) {
        currentOutfit.value = {
          ...currentOutfit.value,
          score: evaluationData.score,
          comment: evaluationData.comment
        }
      }
      // 保存到Session Storage
      saveToSession()
    } catch (error) {
      console.error('提交评价失败', error)
      throw error
    }
  }

  // 删除穿搭
  const deleteOutfit = async (outfitId) => {
    try {
      await deleteOutfitRecord(outfitId)
      // 更新本地数据
      outfits.value = outfits.value.filter(o => o.id !== outfitId)
      if (currentOutfit.value?.id === outfitId) {
        currentOutfit.value = null
      }
      // 保存到Session Storage
      saveToSession()
    } catch (error) {
      console.error('删除穿搭失败', error)
      throw error
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

  // 添加保存穿搭记录的方法
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
        ipAddress = externalDataStore?.locationData?.city || '上海市'
      } catch (e) {
        console.warn('获取位置信息失败:', e)
        ipAddress = '上海市' // 默认值
      }
      
      // 调试输出
      console.log('准备保存场景ID:', outfitResultStore.sceneId)
      console.log('准备保存突出形象标签:', outfitResultStore.highlightTags)
      
      // 直接使用已经格式化好的字符串
      const sceneId = outfitResultStore.sceneId || outfitData.sceneId || '日常场景'
      const highlightImageUrl = outfitResultStore.highlightTags || outfitData.highlightTags || '日常风格'
      
      // 构建请求参数 - 不需要再做格式转换
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
        sceneId: sceneId,
        highlightImageUrl: highlightImageUrl
      }
      
      console.log('调用保存接口，参数:', requestParams)
      
      // 调用保存接口
      const response = await saveOutfit(requestParams)
      
      console.log('保存接口响应:', response)
      
      if (response && response.success) {
        // 如果保存成功，添加到本地数据中
        const newRecord = {
          id: response.data?.outfitId || `outfit_${Date.now()}`,
          userId: outfitData.userId,
          imageUrl: outfitData.imageUrl,
          description: outfitData.description || '',
          occasion: outfitData.occasion || '',
          styleType: outfitData.styleType || '',
          createdAt: new Date().toISOString(),
          status: 'pending', // 表示待评价状态
          
          // 保存接口返回的额外信息（如果有）
          outfitId: response.data?.message,
          date: response.data?.date
        }
        
        // 添加到数组开头，新记录显示在前面
        outfits.value.unshift(newRecord)
        
        // 保存到Session Storage
        saveToSession()
        
        console.log('穿搭记录保存成功:', newRecord)
        return newRecord
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