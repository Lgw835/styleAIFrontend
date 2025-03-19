import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { 
  recommendOutfit,
  generateOutfitImage, 
  followUpOutfit 
} from '@/api/outfit'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'

// Session Storage 键名常量 - 确保所有地方使用同一个key
const SESSION_STORAGE_KEY = 'outfitResultData'

export const useOutfitResultStore = defineStore('outfitResult', {
  state: () => {
    // 使用统一的 SESSION_STORAGE_KEY
    const savedData = sessionStorage.getItem(SESSION_STORAGE_KEY)
    let initialState = {
      currentVersionIndex: 0,
      versionHistory: [],
      outfitImage: '',
      outfitId: null,
      allowSave: true,
      initialRecommendation: null,
      sceneId: '日常场景',
      highlightTags: '#日常风格',
      currentEvaluation: null,
      isInitialized: false  // 添加初始化标记
    }

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        initialState = {
          ...initialState,
          ...parsed,
          isInitialized: true  // 标记为已初始化
        }
        console.log('从 sessionStorage 恢复的数据:', initialState)
      } catch (e) {
        console.error('解析 sessionStorage 数据失败:', e)
      }
    }

    return initialState
  },
  
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
        outfitImage: data.outfitImage || '',
        timestamp: new Date().toISOString(),
        description: '初始推荐方案'
      }
      
      // 重置历史并添加第一个版本
      this.versionHistory = [firstVersion]
      this.currentVersionIndex = 0
      this.initialRecommendation = data
      
      // 保存场景和标签
      this.sceneId = data.sceneId || '日常场景'
      // 确保 highlightTags 以#开头
      const tags = data.highlightTags || '#日常风格'
      this.highlightTags = tags.startsWith('#') ? tags : '#' + tags
      
      // 标记为已初始化
      this.isInitialized = true
      
      // 立即保存到 sessionStorage
      this.saveToSession()
      
      console.log('存储完成，当前 store 状态:', {
        sceneId: this.sceneId,
        highlightTags: this.highlightTags,
        versionHistory: this.versionHistory
      })
    },
    
    // 从sessionStorage恢复数据（处理页面刷新情况）
    restoreFromSession() {
      try {
        const savedData = sessionStorage.getItem(SESSION_STORAGE_KEY)
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
            this.sceneId = parsedData.sceneId || '日常场景'
            // 确保恢复的 highlightTags 以#开头
            const tags = parsedData.highlightTags || '#日常风格'
            this.highlightTags = tags.startsWith('#') ? tags : '#' + tags
          } else if (parsedData.readablePlan) {
            // 兼容旧的数据结构：如果没有版本历史但有直接字段
            const version = {
              version: 1,
              readablePlan: parsedData.readablePlan || '',
              imagePrompt: parsedData.imagePrompt || '',
              summary: parsedData.summary || '',
              outfitImage: parsedData.outfitImage || '',
              timestamp: new Date().toISOString(),
              description: '从旧格式恢复的方案'
            }
            this.versionHistory = [version]
            this.currentVersionIndex = 0
            this.outfitImage = parsedData.outfitImage || ''
            this.outfitId = parsedData.outfitId || null
            this.sceneId = parsedData.sceneId || '日常场景'
            // 这里也确保以#开头
            const tags = parsedData.highlightTags || '#日常风格'
            this.highlightTags = tags.startsWith('#') ? tags : '#' + tags
          }
        }
      } catch (error) {
        console.error('从会话恢复数据失败:', error)
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
          allowSave: this.allowSave,
          sceneId: this.sceneId,
          highlightTags: this.highlightTags,
          currentEvaluation: this.currentEvaluation
        }
        
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(dataToSave))
        console.log('数据已保存到 sessionStorage:', dataToSave)
      } catch (error) {
        console.error('保存数据到会话失败:', error)
      }
    },
    
    // 监听数据变化，自动保存到sessionStorage
    watchData() {
      watch(
        () => [
          this.currentVersionIndex,
          JSON.stringify(this.versionHistory),
          this.outfitImage,
          this.outfitId,
          this.sceneId,
          this.highlightTags,
          this.currentEvaluation
        ], 
        () => {
          // 只有在初始化完成后才保存数据
          if (this.isInitialized) {
            console.log('数据变化，保存到sessionStorage')
            this.saveToSession()
          }
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
        outfitImage: data.outfitImage || '',
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
      
      // 同时更新全局图片变量，使其显示当前版本的图片
      const currentVersion = this.versionHistory[versionIndex]
      if (currentVersion && currentVersion.outfitImage) {
        this.outfitImage = currentVersion.outfitImage
      } else {
        this.outfitImage = '' // 如果当前版本没有图片，清空图片显示
      }
      
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
      this.isInitialized = false  // 重置初始化标记
      this.versionHistory = []
      this.currentVersionIndex = 0
      this.outfitImage = ''
      this.outfitId = null
      this.allowSave = true
      this.initialRecommendation = null
      this.sceneId = '日常场景'
      this.highlightTags = '#日常风格'  // 添加#
      this.currentEvaluation = null
      
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
        console.log('outfitResultStore: 已清除会话存储')
      } catch (error) {
        console.error('清除会话存储失败:', error)
      }
    },
    
    // 设置图片URL
    setOutfitImage(imageUrl) {
      // 存储到全局变量（为了兼容现有代码）
      this.outfitImage = imageUrl
      
      // 同时更新当前版本的图片
      if (this.versionHistory.length > 0 && this.currentVersionIndex >= 0) {
        this.versionHistory[this.currentVersionIndex].outfitImage = imageUrl
      }
      
      // 保存到会话存储
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
        summary: response.summary || response.data?.summary,
        outfitImage: response.outfitImage || response.data?.outfitImage
      }, userMessage)
      
      return response
    },
    
    // 清空结果 - 与resetAll相同
    clearResults() {
      this.resetAll()
    },
    
    // 生成方案函数
    async generatePlan(data) {
      try {
        // 使用统一的API
        const response = await recommendOutfit(data)
        // 处理响应...
      } catch (error) {
        // 错误处理...
      }
    },
    
    // 生成图片函数
    async generateImage(prompt) {
      try {
        // 使用统一的API
        const response = await generateOutfitImage({
          prompt,
          userId: userId.value
        })
        // 处理响应...
      } catch (error) {
        // 错误处理...
      }
    },
    
    // 方案跟进函数
    async followUp(promptText) {
      try {
        // 使用统一的API
        const response = await followUpOutfit({
          userId: userId.value,
          plan: readablePlan.value,
          prompt: promptText
        })
        // 处理响应...
      } catch (error) {
        // 错误处理...
      }
    },
    
    // 保存场景和标签方法
    setSceneAndTags(scene, tags) {
      // 如果已经初始化且有值，则不覆盖
      if (this.isInitialized && this.sceneId !== '日常场景' && this.highlightTags !== '日常风格') {
        console.log('已有场景和标签数据，跳过设置')
        return true
      }
      
      this.sceneId = scene || '日常场景'
      
      // 直接保存为字符串，确保以#开头
      if (Array.isArray(tags) && tags.length > 0) {
        this.highlightTags = '#' + tags.join('#')  // 添加开头的#
      } else if (typeof tags === 'string') {
        // 如果是字符串，确保以#开头
        this.highlightTags = tags.startsWith('#') ? tags : '#' + tags
      } else {
        this.highlightTags = '#日常风格'  // 默认值也加上#
      }
      
      this.saveToSession()
      return true
    },
  }
}) 