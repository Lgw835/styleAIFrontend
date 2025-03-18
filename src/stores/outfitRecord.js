import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import mitt from 'mitt'
import { useUserStore } from '@/stores/user'
// 导入统一的API
import { 
  getOutfitRecords, 
  getOutfitDetail, 
  saveOutfitComment, 
  deleteOutfitRecord,
  evaluateOutfit 
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
    saveToSession
  }
}) 