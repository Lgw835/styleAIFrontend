import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
// 导入统一的API
import { getFashionEvaluations, evaluateOutfit } from '@/api/outfit'
import { useOutfitResultStore } from '@/stores/outfitResult'

// Session Storage的key常量
const EVALUATION_STORAGE_KEY = 'outfit_evaluations'

export const useOutfitStore = defineStore('outfit', {
  state: () => ({
    // 所有评价记录列表 - 与session storage中的数据结构保持一致
    outfit_evaluations: [], // 改为与session storage key一致的命名
    // 当前选中的评价
    currentEvaluation: null,
    // 加载状态
    loading: false,
    // 错误信息
    error: null,
    // 最后获取评价记录的时间
    lastEvaluationFetchTime: null
  }),
  
  actions: {
    // 设置当前选中的评价
    setCurrentEvaluation(evaluation) {
      this.currentEvaluation = evaluation
      
      // 如果存在outfitResultStore，则也设置其currentEvaluation
      try {
        const outfitResultStore = useOutfitResultStore()
        if (outfitResultStore) {
          // 传递评价数据到outfitResultStore
          outfitResultStore.currentEvaluation = evaluation
          
          // 如果有图片，则设置到outfitImage
          if (evaluation && (evaluation.imagePath || evaluation.url || evaluation.fileUrl)) {
            outfitResultStore.outfitImage = evaluation.imagePath || evaluation.url || evaluation.fileUrl
          }
          
          console.log('已将评价数据传递到outfitResultStore')
        }
      } catch (error) {
        console.error('传递评价数据到outfitResultStore失败:', error)
      }
    },
    
    // 从sessionStorage加载数据
    loadFromSessionStorage() {
      try {
        const storedData = sessionStorage.getItem(EVALUATION_STORAGE_KEY)
        if (storedData) {
          console.log('从SessionStorage找到持久化数据', storedData.substring(0, 100) + '...')
          
          // 解析存储的数据
          const parsedData = JSON.parse(storedData)
          
          // 确保数据是数组
          if (Array.isArray(parsedData)) {
            this.outfit_evaluations = parsedData
            console.log('成功加载评价数据数组，条目数:', this.outfit_evaluations.length)
            this.lastEvaluationFetchTime = Date.now()
            return true
          } else {
            console.warn('SessionStorage中的数据不是数组格式')
          }
        } else {
          console.log('SessionStorage中没有找到数据')
        }
      } catch (err) {
        console.error('从SessionStorage加载数据失败:', err)
      }
      return false
    },
    
    // 保存到sessionStorage
    saveToSessionStorage() {
      try {
        // 确保数据是数组
        if (!Array.isArray(this.outfit_evaluations)) {
          console.warn('保存的outfit_evaluations不是数组，创建空数组')
          this.outfit_evaluations = []
        }
        
        // 序列化前打印一部分数据，方便调试
        console.log('准备保存到SessionStorage的数据:',
          this.outfit_evaluations.length > 0 
            ? JSON.stringify(this.outfit_evaluations[0]).substring(0, 100) + '...'
            : '[]'
        )
        
        // 保存数组
        sessionStorage.setItem(EVALUATION_STORAGE_KEY, JSON.stringify(this.outfit_evaluations))
        console.log('成功保存评价数据到SessionStorage，条目数:', this.outfit_evaluations.length)
        return true
      } catch (error) {
        console.error('保存评价数据到sessionStorage失败:', error)
        return false
      }
    },
    
    // 获取所有评价记录
    async fetchEvaluations(forceRefresh = false) {
      console.log('开始获取评价记录, forceRefresh=', forceRefresh);
      
      // 1. 如果强制刷新，直接跳过缓存检查
      if (forceRefresh) {
        console.log('强制刷新模式，跳过缓存检查');
        return this.fetchFromAPI();
      }
      
      // 2. 首先检查pinia中是否已有数据
      if (this.outfit_evaluations && this.outfit_evaluations.length > 0) {
        console.log('使用pinia中已有的评价数据，数量:', this.outfit_evaluations.length);
        
        // 如果缓存已过期，在后台刷新数据但仍使用已有数据
        if (this.needRefreshEvaluations()) {
          console.log('pinia数据已过期，后台刷新...');
          this.fetchFromAPI().catch(err => console.error('后台刷新失败:', err));
        }
        
        return;
      }
      
      // 3. pinia没有数据，尝试从session存储加载
      const hasSessionData = this.loadFromSessionStorage();
      if (hasSessionData) {
        console.log('从session存储加载到数据，数量:', this.outfit_evaluations.length);
        
        // 如果从session加载的数据已过期，后台刷新
        if (this.needRefreshEvaluations()) {
          console.log('session数据已过期，后台刷新...');
          this.fetchFromAPI().catch(err => console.error('后台刷新失败:', err));
        }
        
        return;
      }
      
      // 4. 如果pinia和session都没有数据，从API获取
      console.log('pinia和session存储均无数据，从API获取');
      return this.fetchFromAPI();
    },
    
    // 实际从API获取数据的方法
    async fetchFromAPI() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn || !userStore.userInfo?.userId) {
        console.log('用户未登录，不获取评价数据')
        this.outfit_evaluations = []
        return
      }
      
      this.loading = true
      
      try {
        console.log('从API获取评价记录，用户ID:', userStore.userInfo.userId)
        
        const response = await getFashionEvaluations(userStore.userInfo.userId)
        console.log('API响应完整数据:', response)
        
        // 处理返回的数据
        if (Array.isArray(response)) {
          // 直接使用返回的数组，保持字段名一致
          this.outfit_evaluations = response
          this.lastEvaluationFetchTime = Date.now()
          this.saveToSessionStorage()
          console.log('已更新评价数据并保存到会话存储，条目数:', this.outfit_evaluations.length)
        } else {
          console.log('API返回空数据，显示空状态')
          this.outfit_evaluations = []
          this.lastEvaluationFetchTime = Date.now()
          this.saveToSessionStorage()
        }
      } catch (error) {
        console.error('获取评价数据时出错:', error)
      } finally {
        this.loading = false
        console.log('评价数据获取完成，最终结果条目数:', this.outfit_evaluations.length)
      }
    },
    
    // 添加或更新评价记录
    async addEvaluation(evaluation) {
      try {
        console.log('添加评价记录:', evaluation)
        
        // 确保评价数据有必要的字段
        if (!evaluation.reviewId) {
          console.warn('评价数据缺少reviewId，可能无法正确保存')
        }
        
        const newEvaluation = {
          userId: evaluation.userId,
          reviewId: evaluation.reviewId || `review_${Date.now()}`, // 确保有reviewId
          imagePath: evaluation.imagePath || evaluation.url || evaluation.fileUrl,
          description: evaluation.description || '',
          advantages: evaluation.advantages || '',
          disadvantages: evaluation.disadvantages || '',
          suggestions: evaluation.suggestions || '',
          score: evaluation.score || 0,
          createdAt: evaluation.createdAt || new Date().toISOString()
        }
        
        // 检查是否已存在相同reviewId的评价
        const existingIndex = this.outfit_evaluations.findIndex(
          item => item.reviewId === newEvaluation.reviewId
        )
        
        if (existingIndex >= 0) {
          console.log('更新已存在的评价记录')
          // 更新已存在的评价
          this.outfit_evaluations[existingIndex] = newEvaluation
        } else {
          console.log('添加新的评价记录')
          // 添加新评价到数组开头，使最新的评价显示在最前面
          this.outfit_evaluations.unshift(newEvaluation)
        }
        
        // 保存到session storage
        const saveResult = this.saveToSessionStorage()
        console.log('保存评价到Session storage:', saveResult ? '成功' : '失败')
        
        return true
      } catch (error) {
        console.error('保存评价记录出错:', error)
        return false
      }
    },
    
    // 根据ID和图片路径查找评价
    findEvaluationByIdAndImage(userId, imagePath) {
      return this.outfit_evaluations.find(item => 
        item.userId === userId && item.imagePath === imagePath
      )
    },
    
    // 清除所有数据（用于退出登录等场景）
    clearEvaluations() {
      this.outfit_evaluations = []
      this.currentEvaluation = null
      sessionStorage.removeItem(EVALUATION_STORAGE_KEY)
    },
    
    // 添加判断是否需要刷新评价数据的方法
    needRefreshEvaluations() {
      const lastFetchTime = this.lastEvaluationFetchTime
      if (!lastFetchTime) return true
      
      // 检查是否超过30分钟
      const now = new Date().getTime()
      const thirtyMinutes = 30 * 60 * 1000
      return now - lastFetchTime > thirtyMinutes
    }
  }
}) 