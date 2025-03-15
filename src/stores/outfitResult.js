import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useOutfitResultStore = defineStore('outfitResult', {
  state: () => ({
    outfitPlan: '',
    aiPrompt: '',
    outfitImage: '',
    occasion: '',
    currentVersion: 1,
    versionHistory: [],
    outfitId: null,
    canSave: true
  }),
  
  actions: {
    // 初始化推荐
    setInitialRecommendation(data) {
      this.outfitPlan = data.readablePlan || ''
      this.aiPrompt = data.imagePrompt || ''
      this.occasion = data.occasion || ''
      
      // 清空当前图片
      this.outfitImage = ''
      
      // 重置版本历史
      this.currentVersion = 1
      this.versionHistory = [{
        version: 1,
        plan: this.outfitPlan,
        prompt: this.aiPrompt,
        description: '初始推荐',
        timestamp: new Date().toISOString()
      }]
      
      // 重置保存状态
      this.outfitId = null
      this.canSave = true
    },
    
    // 从sessionStorage恢复数据（处理页面刷新情况）
    restoreFromSession() {
      try {
        const savedData = sessionStorage.getItem('outfitResultData')
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          
          // 恢复各项数据
          this.currentVersion = parsedData.currentVersion || 1
          this.outfitPlan = parsedData.outfitPlan || ''
          this.aiPrompt = parsedData.aiPrompt || ''
          this.outfitImage = parsedData.outfitImage || ''
          this.versionHistory = parsedData.versionHistory || []
          this.occasion = parsedData.occasion || ''
          this.outfitId = parsedData.outfitId || null
        }
      } catch (error) {
        console.error('从会话恢复数据失败', error)
      }
    },
    
    // 保存数据到sessionStorage
    saveToSession() {
      try {
        const dataToSave = {
          currentVersion: this.currentVersion,
          outfitPlan: this.outfitPlan,
          aiPrompt: this.aiPrompt,
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
      watch([this.currentVersion, this.outfitPlan, this.aiPrompt, this.outfitImage, this.versionHistory], () => {
        this.saveToSession()
      }, { deep: true })
    },
    
    // 添加到版本历史
    addToVersionHistory(description, summary) {
      const now = new Date()
      const timestamp = now.toISOString()
      
      // 创建深拷贝以避免引用问题
      const version = {
        version: this.currentVersion,
        timestamp,
        description,
        summary: summary || '',
        plan: this.outfitPlan,
        prompt: this.aiPrompt,
        image: this.outfitImage,
        occasion: this.occasion,
        outfitId: this.outfitId
      }
      
      // 检查是否已存在相同版本号的记录
      const existingIndex = this.versionHistory.findIndex(v => v.version === this.currentVersion)
      if (existingIndex >= 0) {
        this.versionHistory[existingIndex] = version
      } else {
        this.versionHistory.push(version)
      }
      
      // 自动保存到会话存储
      this.saveToSession()
    },
    
    // 恢复到特定版本
    restoreVersion(version) {
      if (!version) return null
      
      console.log('正在切换到版本:', version.version)
      
      // 设置当前版本号
      this.currentVersion = version.version
      
      // 恢复穿搭方案
      if (version.plan) {
        this.outfitPlan = version.plan
      }
      
      // 恢复AI提示词
      this.aiPrompt = version.prompt || ''
      
      // 恢复图片
      this.outfitImage = version.image || ''
      
      // 确认版本已更新
      console.log('已更新当前版本为:', this.currentVersion)
      
      // 自动保存到会话存储
      this.saveToSession()
      
      return version
    },
    
    // 重置所有数据
    resetAll() {
      this.currentVersion = 1
      this.outfitPlan = ''
      this.aiPrompt = ''
      this.outfitImage = ''
      this.versionHistory = []
      this.occasion = ''
      this.outfitId = null
      
      // 清除会话存储
      sessionStorage.removeItem('outfitResultData')
    },
    
    // 解析穿搭方案文本
    parseOutfitPlan(planText) {
      // 直接设置原始 Markdown 文本，不做解析
      if (planText) {
        this.outfitPlan = planText
      }
      return planText
    },
    
    // 格式化穿搭方案为字符串
    formatOutfitPlanToString() {
      // 直接返回原始 Markdown 字符串
      return this.outfitPlan
    },
    
    // 更新版本号并创建新版本
    createNewVersion() {
      this.currentVersion++
      return this.currentVersion
    },
    
    // 更新outfitId
    updateOutfitId(id) {
      this.outfitId = id
    }
  },
  
  getters: {
    // 是否可以保存的计算属性
    canSave: (state) => state.outfitImage !== ''
  }
}) 