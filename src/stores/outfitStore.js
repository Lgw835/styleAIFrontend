import { defineStore } from 'pinia'

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
    async fetchEvaluations() {
      // 先尝试从sessionStorage读取
      if (this.loadFromSessionStorage() && this.evaluations.length > 0) {
        console.log('从SessionStorage加载了评价数据')
        return
      }
      
      const userId = localStorage.getItem('userId') || '1'
      
      this.loading = true
      this.error = null
      
      try {
        // TODO: 取消注释以使用真实API调用
        // const result = await getFashionEvaluations(userId)
        // this.evaluations = result || []
        
        // 模拟API响应数据
        await new Promise(resolve => {
          setTimeout(() => {
            this.evaluations = this.getMockEvaluations(userId)
            this.loading = false
            resolve()
          }, 800)
        })
        
        // 保存到sessionStorage
        this.saveToSessionStorage()
      } catch (err) {
        console.error('获取穿搭评价失败:', err)
        this.error = '获取评价记录失败，请稍后再试'
        this.loading = false
      }
    },
    
    // 添加新的评价记录
    addEvaluation(evaluation) {
      // 检查是否已存在相同评价（避免重复）
      const existingIndex = this.evaluations.findIndex(item => 
        item.userId === evaluation.userId && item.imagePath === evaluation.imagePath
      )
      
      if (existingIndex >= 0) {
        // 更新已有评价
        this.evaluations.splice(existingIndex, 1, evaluation)
      } else {
        // 添加新评价到列表开头（最新的显示在前面）
        this.evaluations.unshift(evaluation)
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
    },
    
    // 模拟评价数据
    getMockEvaluations(userId) {
      return [
        {
          userId: userId,
          imagePath: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=200&h=200&fit=crop',
          description: '整体搭配简约干净，休闲中带有活力感。建议可以尝试戴一顶棒球帽或选择亮色系的运动鞋来增加层次感和个性，让整体造型更加突出。',
          advantages: [
            '色彩搭配和谐，整体风格统一',
            '服装尺寸合适，展现良好的身材比例',
            '造型简洁利落，展现活力'
          ],
          disadvantages: [
            '配饰缺乏亮点，层次感不足',
            '整体风格较为安全，个性不足'
          ],
          suggestions: [
            '可以添加一些亮色点缀，如鲜艳的领带或口袋巾',
            '尝试搭配质感配饰，提升整体档次',
            '可以考虑在单品上选择更有设计感的款式'
          ],
          score: 8.5,
          summary: '整体搭配和谐，风格统一，但缺乏亮点和个性',
          createdTime: '2023-10-15T12:30:00'
        },
        {
          userId: userId,
          imagePath: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&h=200&fit=crop',
          description: '这套商务休闲风格穿搭非常得体，色彩搭配和谐。建议可以选择深色系的皮鞋和皮带来呼应上衣，并考虑增加口袋巾等细节，提升整体质感。',
          advantages: [
            '商务休闲风格把握精准，细节考究',
            '色彩搭配专业协调',
            '面料选择高级，展现品质感'
          ],
          disadvantages: [
            '颜色偏暗沉，缺少亮点',
            '造型略显刻板，个性表达不足'
          ],
          suggestions: [
            '可以考虑通过领带或袖扣增加一些亮色点缀',
            '尝试搭配轻奢配饰，提升整体档次',
            '可以在保持商务风格的前提下，选择更具设计感的单品'
          ],
          score: 9.2,
          summary: '商务风格专业得体，细节考究，但略显保守',
          createdTime: '2023-10-10T09:15:00'
        },
        {
          userId: userId,
          imagePath: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=200&h=200&fit=crop',
          description: '简约单色系穿搭，整体效果清爽利落。可以考虑增加配饰如项链或手表增强细节，选择纹理感面料提升质感。',
          advantages: [
            '简约时尚，干净利落',
            '色彩统一，视觉效果协调',
            '穿着舒适自然，展现生活态度'
          ],
          disadvantages: [
            '略显单调，个性不够突出',
            '缺乏层次感和细节表达'
          ],
          suggestions: [
            '建议增加一些配饰，如项链或胸针增加亮点',
            '尝试在单色系中选择不同质感的面料，增加层次',
            '可以通过鞋履或包袋增加造型重点'
          ],
          score: 7.8,
          summary: '简约干净，舒适自然，但略显单调缺乏层次',
          createdTime: '2023-10-05T15:45:00'
        }
      ]
    }
  }
}) 