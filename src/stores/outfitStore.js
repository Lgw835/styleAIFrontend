import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
// 导入真实API
import { getFashionEvaluations } from '@/api/outfit'
import { useOutfitResultStore } from '@/stores/outfitResult'

// Session Storage的key常量
const EVALUATION_STORAGE_KEY = 'outfit_evaluations'

export const useOutfitStore = defineStore('outfit', {
  state: () => ({
    // 所有评价记录列表
    evaluations: [],
    // 当前选中的评价
    currentEvaluation: null,
    // 加载状态
    loading: false,
    // 错误信息
    error: null
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
          this.evaluations = JSON.parse(storedData)
          return true
        }
      } catch (err) {
        console.error('从SessionStorage加载数据失败:', err)
      }
      return false
    },
    
    // 保存数据到sessionStorage
    saveToSessionStorage() {
      try {
        sessionStorage.setItem(EVALUATION_STORAGE_KEY, JSON.stringify(this.evaluations))
      } catch (err) {
        console.error('保存数据到SessionStorage失败:', err)
      }
    },
    
    // 获取所有评价记录
    async fetchEvaluations(forceRefresh = false) {
      // 如果不是强制刷新且有本地数据，使用本地数据
      if (!forceRefresh && this.loadFromSessionStorage() && this.evaluations.length > 0) {
        console.log('从SessionStorage加载了评价数据')
        return
      }
      
      // 获取用户ID
      const userStore = useUserStore()
      const userId = userStore?.userInfo?.userId
      if (!userId) {
        console.error('未找到用户ID，无法获取评价记录')
        this.error = '未找到用户ID，请先登录'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        // 使用真实API调用获取数据
        const result = await getFashionEvaluations(userId)
        
        if (Array.isArray(result)) {
          // 规范化数据
          this.evaluations = result.map(item => ({
            ...item,
            imagePath: item.imagePath || item.url || item.fileUrl
          }))
          
          // 保存到sessionStorage，确保刷新后能恢复
          this.saveToSessionStorage()
          console.log('已从API获取评价数据并保存到本地')
        } else {
          console.warn('API返回的数据不是数组:', result)
          if (!this.evaluations.length) {
            this.evaluations = []
          }
        }
      } catch (err) {
        console.error('获取穿搭评价失败:', err)
        this.error = '获取评价记录失败，请稍后再试'
        
        // 如果API调用失败但有本地数据，使用本地数据
        if (!this.evaluations.length) {
          this.loadFromSessionStorage()
        }
      } finally {
        this.loading = false
      }
    },
    
    // 添加新的评价记录
    addEvaluation(evaluation) {
      // 确保imagePath字段存在
      const imagePath = evaluation.imagePath || evaluation.url || evaluation.fileUrl
      
      if (!imagePath) {
        console.error('评价数据缺少图片路径')
        return
      }
      
      const normalizedEvaluation = {
        ...evaluation,
        imagePath
      }
      
      // 检查是否已存在相同评价
      const existingIndex = this.evaluations.findIndex(item => 
        item.userId === normalizedEvaluation.userId && 
        item.imagePath === normalizedEvaluation.imagePath
      )
      
      if (existingIndex >= 0) {
        // 更新已有评价
        this.evaluations.splice(existingIndex, 1, normalizedEvaluation)
      } else {
        // 添加新评价到列表开头
        this.evaluations.unshift(normalizedEvaluation)
      }
      
      // 保存到sessionStorage
      this.saveToSessionStorage()
    },
    
    // 根据ID和图片路径查找评价
    findEvaluationByIdAndImage(userId, imagePath) {
      return this.evaluations.find(item => 
        item.userId === userId && item.imagePath === imagePath
      )
    },
    
    // 清除所有数据（用于退出登录等场景）
    clearEvaluations() {
      this.evaluations = []
      this.currentEvaluation = null
      sessionStorage.removeItem(EVALUATION_STORAGE_KEY)
    }
  }
}) 