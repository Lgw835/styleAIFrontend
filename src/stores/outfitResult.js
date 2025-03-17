import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useOutfitResultStore = defineStore('outfitResult', {
  state: () => ({
    readablePlan: '',
    imagePrompt: '',
    summary: '',
    outfitImage: '',
    occasion: '',
    currentVersion: 1,
    versionHistory: [],
    outfitId: null,
    allowSave: true,
    currentEvaluation: null,
    initialRecommendation: null
  }),
  
  actions: {
    // 初始化推荐，存储 API 返回的数据
    setInitialRecommendation(data) {
      console.log('接收到API数据:', data)
      
      // 直接使用API返回的字段名
      this.readablePlan = data.readablePlan
      this.imagePrompt = data.imagePrompt
      this.summary = data.summary
      
      // 创建第一个版本记录 - 使用相同的字段名
      this.versionHistory = [{
        version: 1,
        readablePlan: this.readablePlan,
        imagePrompt: this.imagePrompt,
        summary: this.summary,
        timestamp: new Date().toISOString()
      }]
      
      console.log('存储完成:', {
        readablePlan: this.readablePlan,
        imagePrompt: this.imagePrompt,
        summary: this.summary,
        versionHistory: this.versionHistory
      })
    },
    
    // 从sessionStorage恢复数据（处理页面刷新情况）
    restoreFromSession() {
      try {
        const savedData = sessionStorage.getItem('outfitResultData')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          
          // 恢复各项数据
          this.currentVersion = parsedData.currentVersion || 1
          this.readablePlan = parsedData.readablePlan || ''
          this.imagePrompt = parsedData.imagePrompt || ''
          this.summary = parsedData.summary || ''
          this.outfitImage = parsedData.outfitImage || ''
          this.versionHistory = parsedData.versionHistory || []
          this.occasion = parsedData.occasion || ''
          this.outfitId = parsedData.outfitId || null
        }
      } catch (error) {
        console.error('从会话恢复数据失败', error)
      }
    },
    
    // 保存到会话存储以便页面刷新时恢复
    saveToSession() {
      try {
        const dataToSave = {
          currentVersion: this.currentVersion,
          readablePlan: this.readablePlan,
          imagePrompt: this.imagePrompt,
          summary: this.summary,
          outfitImage: this.outfitImage,
          versionHistory: this.versionHistory,
          occasion: this.occasion,
          outfitId: this.outfitId
        }
        
        sessionStorage.setItem('outfitResultData', JSON.stringify(dataToSave))
      } catch (error) {
        console.error('保存数据到会话失败', error)
      }
    },
    
    // 监听数据变化，自动保存到sessionStorage
    watchData() {
      watch([this.currentVersion, this.readablePlan, this.imagePrompt, this.outfitImage, this.versionHistory], () => {
        this.saveToSession()
      }, { deep: true })
    },
    
    // 添加新版本
    addVersion(data, comment) {
      this.currentVersion++
      
      // 使用一致的字段名
      const newVersion = {
        version: this.currentVersion,
        readablePlan: data.readablePlan || this.readablePlan,
        imagePrompt: data.imagePrompt || this.imagePrompt,
        summary: data.summary || this.summary,
        timestamp: new Date().toISOString(),
        comment: comment
      }
      
      // 添加到历史
      this.versionHistory.push(newVersion)
      
      // 更新当前数据
      this.readablePlan = newVersion.readablePlan
      this.imagePrompt = newVersion.imagePrompt
      this.summary = newVersion.summary
    },
    
    // 切换版本
    switchVersion(versionNumber) {
      const version = this.versionHistory.find(v => v.version === versionNumber)
      if (!version) return false
      
      // 使用正确字段名更新当前数据
      this.currentVersion = versionNumber
      this.readablePlan = version.readablePlan
      this.imagePrompt = version.imagePrompt
      this.summary = version.summary
      
      return true
    },
    
    // 重置所有数据
    resetAll() {
      this.readablePlan = ''
      this.imagePrompt = ''
      this.summary = ''
      this.outfitImage = ''
      this.currentVersion = 1
      this.versionHistory = []
      this.outfitId = null
      this.allowSave = true
      
      // 清除会话存储
      sessionStorage.removeItem('outfitResultData')
    },
    
    // 解析穿搭方案文本
    parseOutfitPlan(planText) {
      // 直接设置原始 Markdown 文本，不做解析
      if (planText) {
        this.readablePlan = planText
      }
      return planText
    },
    
    // 格式化穿搭方案为字符串
    formatOutfitPlanToString() {
      // 直接返回原始 Markdown 字符串
      return this.readablePlan
    },
    
    // 更新版本号并创建新版本
    createNewVersion() {
      this.currentVersion++
      return this.currentVersion
    },
    
    // 更新outfitId
    updateOutfitId(id) {
      this.outfitId = id
    },
    
    setOutfitImage(imageUrl) {
      this.outfitImage = imageUrl
    },
    
    setAIPrompt(prompt) {
      this.imagePrompt = prompt
    },
    
    incrementVersion() {
      this.currentVersion++
    },
    
    addToHistory(version) {
      this.versionHistory.push(version)
    },
    
    setCurrentEvaluation(evaluation) {
      this.currentEvaluation = evaluation
    }
  },
  
  getters: {
    // 是否可以保存的计算属性
    canSave: (state) => state.outfitImage !== ''
  }
}) 