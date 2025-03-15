import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useOutfitResultStore = defineStore('outfitResult', () => {
  // 当前版本号
  const currentVersion = ref(1)
  
  // 穿搭方案数据
  const outfitPlan = ref('')
  
  // AI提示词
  const aiPrompt = ref('')
  
  // 生成的图片URL或base64
  const outfitImage = ref(null)
  
  // 版本历史记录
  const versionHistory = ref([])
  
  // 是否可以保存的计算属性
  const canSave = computed(() => outfitImage.value !== null)
  
  // 从sessionStorage恢复数据（处理页面刷新情况）
  function restoreFromSession() {
    try {
      const savedData = sessionStorage.getItem('outfitResultData')
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        
        // 恢复各项数据
        currentVersion.value = parsedData.currentVersion || 1
        outfitPlan.value = parsedData.outfitPlan || ''
        aiPrompt.value = parsedData.aiPrompt || ''
        outfitImage.value = parsedData.outfitImage || null
        versionHistory.value = parsedData.versionHistory || []
      }
    } catch (error) {
      console.error('从会话恢复数据失败', error)
    }
  }
  
  // 保存数据到sessionStorage
  function saveToSession() {
    try {
      const dataToSave = {
        currentVersion: currentVersion.value,
        outfitPlan: outfitPlan.value,
        aiPrompt: aiPrompt.value,
        outfitImage: outfitImage.value,
        versionHistory: versionHistory.value
      }
      
      sessionStorage.setItem('outfitResultData', JSON.stringify(dataToSave))
    } catch (error) {
      console.error('保存数据到会话失败', error)
    }
  }
  
  // 监听数据变化，自动保存到sessionStorage
  watch([currentVersion, outfitPlan, aiPrompt, outfitImage, versionHistory], () => {
    saveToSession()
  }, { deep: true })
  
  // 添加到版本历史
  function addToVersionHistory(description, summary) {
    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    // 创建深拷贝以避免引用问题
    const version = {
      version: currentVersion.value,
      timestamp,
      description,
      summary: summary || '',
      outfit: outfitPlan.value, // 直接存储字符串无需深拷贝
      prompt: aiPrompt.value,
      image: outfitImage.value // 保存图片信息(base64)
    }
    
    // 检查是否已存在相同版本号的记录
    const existingIndex = versionHistory.value.findIndex(v => v.version === currentVersion.value)
    if (existingIndex >= 0) {
      versionHistory.value[existingIndex] = version
    } else {
      versionHistory.value.push(version)
    }
    
    // 自动保存到会话存储
    saveToSession()
  }
  
  // 恢复到特定版本
  function restoreVersion(version) {
    if (!version) return null
    
    console.log('正在切换到版本:', version.version)
    
    // 设置当前版本号
    currentVersion.value = version.version
    
    // 恢复穿搭方案
    if (version.outfit) {
      outfitPlan.value = version.outfit // 直接赋值字符串
    }
    
    // 恢复AI提示词
    aiPrompt.value = version.prompt || ''
    
    // 恢复图片
    outfitImage.value = version.image || null
    
    // 确认版本已更新
    console.log('已更新当前版本为:', currentVersion.value)
    
    // 自动保存到会话存储
    saveToSession()
    
    return version
  }
  
  // 设置初始推荐数据（从DressRecommendView获取）
  function setInitialRecommendation(data) {
    // 重置store
    resetAll()
    
    // 设置新数据
    if (data.readablePlan) {
      outfitPlan.value = data.readablePlan // 直接使用 Markdown 字符串
    }
    
    aiPrompt.value = data.imagePrompt || ''
    
    // 添加到版本历史
    addToVersionHistory('初始方案', data.summary || '初始推荐方案')
    
    // 自动保存到会话存储
    saveToSession()
  }
  
  // 重置所有数据
  function resetAll() {
    currentVersion.value = 1
    outfitPlan.value = ''
    aiPrompt.value = ''
    outfitImage.value = null
    versionHistory.value = []
    
    // 清除会话存储
    sessionStorage.removeItem('outfitResultData')
  }
  
  // 解析穿搭方案文本
  function parseOutfitPlan(planText) {
    // 直接设置原始 Markdown 文本，不做解析
    if (planText) {
      outfitPlan.value = planText
    }
    return planText
  }
  
  // 格式化穿搭方案为字符串
  function formatOutfitPlanToString() {
    // 直接返回原始 Markdown 字符串
    return outfitPlan.value
  }
  
  // 更新版本号并创建新版本
  function createNewVersion() {
    currentVersion.value++
    return currentVersion.value
  }
  
  return {
    // 状态
    currentVersion,
    outfitPlan,
    aiPrompt,
    outfitImage,
    versionHistory,
    
    // 计算属性
    canSave,
    
    // 方法
    addToVersionHistory,
    restoreVersion,
    resetAll,
    parseOutfitPlan,
    formatOutfitPlanToString,
    createNewVersion,
    setInitialRecommendation,
    restoreFromSession,
    saveToSession
  }
}) 