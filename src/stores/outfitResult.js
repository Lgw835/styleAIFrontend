import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { followUpOutfit } from '@/api/outfitResult'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'

export const useOutfitResultStore = defineStore('outfitResult', {
  state: () => ({
    // 不再直接存储方案数据，只存储版本和元数据
    currentVersionIndex: 0, // 当前版本在历史中的索引
    versionHistory: [], // 所有版本历史
    outfitImage: '', // 当前图片URL
    outfitId: null, // 后端ID
    allowSave: true, // 是否允许保存
    initialRecommendation: null // 初始推荐
  }),
  
  getters: {
    // 获取当前版本号
    currentVersion: (state) => {
      if (state.versionHistory.length === 0) return 1
      return state.versionHistory[state.currentVersionIndex]?.version || 1
    },
    
    // 获取当前方案描述
    readablePlan: (state) => {
      if (state.versionHistory.length === 0) return ''
      return state.versionHistory[state.currentVersionIndex]?.readablePlan || ''
    },
    
    // 获取当前AI提示词
    imagePrompt: (state) => {
      if (state.versionHistory.length === 0) return ''
      return state.versionHistory[state.currentVersionIndex]?.imagePrompt || ''
    },
    
    // 获取当前方案总结
    summary: (state) => {
      if (state.versionHistory.length === 0) return ''
      return state.versionHistory[state.currentVersionIndex]?.summary || ''
    },
    
    // 是否可以保存的计算属性
    canSave: (state) => state.outfitImage !== '' && state.versionHistory.length > 0
  },
  
  actions: {
    // 初始化推荐，存储 API 返回的数据
    setInitialRecommendation(data) {
      console.log('接收到API数据:', data)
      
      // 创建第一个版本记录
      const firstVersion = {
        version: 1,
        readablePlan: data.readablePlan || '',
        imagePrompt: data.imagePrompt || '',
        summary: data.summary || '',
        timestamp: new Date().toISOString(),
        description: '初始推荐方案'
      }
      
      // 重置历史并添加第一个版本
      this.versionHistory = [firstVersion]
      this.currentVersionIndex = 0
      this.initialRecommendation = data
      
      // 保存到会话存储
      this.saveToSession()
      
      console.log('存储完成:', {
        currentVersionIndex: this.currentVersionIndex,
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
          if (parsedData.versionHistory && parsedData.versionHistory.length > 0) {
            this.versionHistory = parsedData.versionHistory
            
            // 恢复当前版本索引
            if (typeof parsedData.currentVersionIndex === 'number') {
              this.currentVersionIndex = parsedData.currentVersionIndex
            } else if (typeof parsedData.currentVersion === 'number') {
              // 兼容旧数据格式：根据版本号找到索引
              const versionIndex = this.versionHistory.findIndex(v => v.version === parsedData.currentVersion)
              this.currentVersionIndex = versionIndex >= 0 ? versionIndex : 0
            }
            
            this.outfitImage = parsedData.outfitImage || ''
            this.outfitId = parsedData.outfitId || null
            this.initialRecommendation = parsedData.initialRecommendation || null
          } else if (parsedData.readablePlan) {
            // 兼容旧的数据结构：如果没有版本历史但有直接字段
            const version = {
              version: 1,
              readablePlan: parsedData.readablePlan || '',
              imagePrompt: parsedData.imagePrompt || '',
              summary: parsedData.summary || '',
              timestamp: new Date().toISOString(),
              description: '从旧格式恢复的方案'
            }
            this.versionHistory = [version]
            this.currentVersionIndex = 0
            this.outfitImage = parsedData.outfitImage || ''
            this.outfitId = parsedData.outfitId || null
          }
        }
      } catch (error) {
        console.error('从会话恢复数据失败', error)
      }
    },
    
    // 保存到会话存储以便页面刷新时恢复
    saveToSession() {
      try {
        const dataToSave = {
          currentVersionIndex: this.currentVersionIndex,
          versionHistory: this.versionHistory,
          outfitImage: this.outfitImage,
          outfitId: this.outfitId,
          initialRecommendation: this.initialRecommendation,
          allowSave: this.allowSave
        }
        
        sessionStorage.setItem('outfitResultData', JSON.stringify(dataToSave))
      } catch (error) {
        console.error('保存数据到会话失败', error)
      }
    },
    
    // 监听数据变化，自动保存到sessionStorage
    watchData() {
      watch(
        () => [
          this.currentVersionIndex,
          JSON.stringify(this.versionHistory),
          this.outfitImage,
          this.outfitId
        ], 
        () => {
          console.log('数据变化，保存到sessionStorage')
          this.saveToSession()
        }, 
        { deep: true }
      )
    },
    
    // 添加新版本
    addVersion(data, comment) {
      // 计算新版本号
      const newVersionNumber = this.versionHistory.length > 0 
        ? Math.max(...this.versionHistory.map(v => v.version)) + 1 
        : 1
      
      // 创建新版本对象
      const newVersion = {
        version: newVersionNumber,
        readablePlan: data.readablePlan || '',
        imagePrompt: data.imagePrompt || '',
        summary: data.summary || '',
        timestamp: new Date().toISOString(),
        description: comment || `版本 ${newVersionNumber}`
      }
      
      // 添加到历史
      this.versionHistory.push(newVersion)
      
      // 更新当前版本索引
      this.currentVersionIndex = this.versionHistory.length - 1
      
      // 保存到会话存储
      this.saveToSession()
      
      return newVersionNumber
    },
    
    // 切换版本
    switchVersion(versionNumber) {
      const versionIndex = this.versionHistory.findIndex(v => v.version === versionNumber)
      if (versionIndex === -1) return false
      
      // 更新当前版本索引
      this.currentVersionIndex = versionIndex
      
      // 保存到会话存储
      this.saveToSession()
      
      return true
    },
    
    // 切换到指定索引的版本
    switchToIndex(index) {
      if (index < 0 || index >= this.versionHistory.length) return false
      
      this.currentVersionIndex = index
      this.saveToSession()
      
      return true
    },
    
    // 重置所有数据
    resetAll() {
      // 重置所有状态
      this.versionHistory = []
      this.currentVersionIndex = 0
      this.outfitImage = ''
      this.outfitId = null
      this.allowSave = true
      this.initialRecommendation = null
      
      console.log('outfitResultStore: 重置所有数据')
      
      // 确保清除会话存储
      try {
        sessionStorage.removeItem('outfitResultData')
        console.log('outfitResultStore: 已清除会话存储')
      } catch (error) {
        console.error('清除会话存储失败', error)
      }
    },
    
    // 设置图片URL
    setOutfitImage(imageUrl) {
      this.outfitImage = imageUrl
      this.saveToSession()
    },
    
    // 设置AI提示词（通过修改当前版本）
    setAiPrompt(prompt) {
      if (this.versionHistory.length === 0) return
      
      // 修改当前版本的提示词
      this.versionHistory[this.currentVersionIndex].imagePrompt = prompt
      
      // 保存到会话存储
      this.saveToSession()
    },
    
    // 更新outfitId
    updateOutfitId(id) {
      this.outfitId = id
      this.saveToSession()
    },
    
    // 发送跟进请求，获取AI的进一步建议
    async sendFollowUpRequest(userMessage) {
      const userStore = useUserStore()
      const externalDataStore = useExternalDataStore()
      
      // 验证用户登录状态
      if (!userStore.isLoggedIn || !userStore.userInfo?.userId) {
        throw new Error('用户未登录，无法发送请求')
      }
      
      // 构建请求数据
      const requestData = {
        userId: userStore.userInfo.userId,
        ipAddress: externalDataStore.locationData?.city ? 
          `${externalDataStore.locationData.province || ''} ${externalDataStore.locationData.city}` : "",
        editedPlan: userMessage, // 用户的反馈或编辑
        previousPlan: this.readablePlan, // 使用getter获取当前方案
        additionalInfo: this.summary // 使用getter获取当前summary
      }
      
      console.log('发送穿搭方案跟进请求:', requestData)
      
      // 调用API发送请求
      const response = await followUpOutfit(requestData)
      
      if (!response) {
        throw new Error('获取跟进建议失败')
      }
      
      // 添加新版本
      this.addVersion({
        readablePlan: response.readablePlan || response.data?.readablePlan,
        imagePrompt: response.imagePrompt || response.data?.imagePrompt,
        summary: response.summary || response.data?.summary
      }, userMessage)
      
      return response
    },
    
    // 清空结果 - 与resetAll相同
    clearResults() {
      this.resetAll()
    },
  }
}) 