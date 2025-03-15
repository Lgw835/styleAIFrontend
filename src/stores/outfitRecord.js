import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserOutfitRecords, getOutfitDetail, deleteOutfitRecord, getOutfitEvaluation, submitOutfitEvaluation } from '@/api/outfitApi'
import mitt from 'mitt'
import { useUserStore } from '@/stores/user'

// 创建一个简单的事件发射器
const emitter = mitt()

export const useOutfitRecordStore = defineStore('outfitRecord', () => {
  // 状态
  const outfits = ref([])
  const loading = ref(false)
  const lastFetchTime = ref(null)
  const currentOutfit = ref(null)
  const currentEvaluation = ref(null)

  // 检查是否需要刷新数据
  // 如果超过30分钟没更新数据，则认为数据需要刷新
  const needRefresh = computed(() => {
    if (!lastFetchTime.value) return true
    const now = new Date().getTime()
    const thirtyMinutes = 30 * 60 * 1000
    return now - lastFetchTime.value > thirtyMinutes
  })

  // 从Session Storage加载数据
  const loadFromSession = () => {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('outfitRecordStore'))
      if (sessionData) {
        outfits.value = sessionData.outfits || []
        lastFetchTime.value = sessionData.lastFetchTime || null
        return true
      }
    } catch (error) {
      console.error('从Session Storage加载穿搭记录失败', error)
    }
    return false
  }

  // 保存数据到Session Storage
  const saveToSession = () => {
    try {
      const storeData = {
        outfits: outfits.value,
        lastFetchTime: lastFetchTime.value
      }
      sessionStorage.setItem('outfitRecordStore', JSON.stringify(storeData))
    } catch (error) {
      console.error('保存穿搭记录到Session Storage失败', error)
    }
  }

  // 本地存储键名
  const STORAGE_KEY = 'outfit_records'

  // 保存到本地存储
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        records: outfits.value,
        lastUpdated: new Date().toISOString()
      }))
      return true
    } catch (error) {
      console.error('保存穿搭记录到本地存储失败:', error)
      return false
    }
  }

  // 从本地存储恢复
  const restoreFromStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        outfits.value = parsed.records || []
        return true
      }
    } catch (error) {
      console.error('从本地存储恢复穿搭记录失败:', error)
    }
    return false
  }

  // 重写fetchRecords方法
  const fetchOutfitRecords = async (userId, forceRefresh = false) => {
    // 如果不强制刷新且有本地数据，使用本地数据
    if (!forceRefresh && outfits.value.length > 0) {
      return outfits.value
    }
    
    this.loading = true
    
    try {
      const userStore = useUserStore()
      const actualUserId = userId || userStore.userInfo?.userId
      
      if (!actualUserId) {
        throw new Error('用户未登录')
      }
      
      const response = await getUserOutfitRecords(actualUserId)
      
      if (response && Array.isArray(response)) {
        outfits.value = response
        // 保存到本地存储
        saveToStorage()
        return outfits.value
      } else {
        throw new Error('获取数据格式错误')
      }
    } catch (error) {
      console.error('获取穿搭记录失败:', error)
      this.error = error.message || '获取穿搭记录失败'
      return []
    } finally {
      this.loading = false
    }
  }

  // 获取穿搭详情
  const fetchOutfitDetail = async (outfitId) => {
    // 先从本地数据中查找
    const existingOutfit = outfits.value.find(o => o.id === outfitId)
    if (existingOutfit) {
      currentOutfit.value = existingOutfit
      return existingOutfit
    }
    
    // 如果本地没有，则请求API
    try {
      // TODO: 当API可用时，取消注释下面的代码
      // const response = await getOutfitDetail(outfitId)
      // currentOutfit.value = response.data
      // return response.data
      
      // 目前没有额外的详情数据，直接返回null
      return null
    } catch (error) {
      console.error('获取穿搭详情失败', error)
      throw error
    }
  }

  // 获取穿搭评价
  const fetchOutfitEvaluation = async (outfitId, userId) => {
    try {
      // TODO: 当API可用时，取消注释下面的代码
      // const response = await getOutfitEvaluation(outfitId, userId)
      // currentEvaluation.value = response.data
      // return response.data
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟数据 - 根据outfitId生成不同的模拟评价
      if (outfitId === '001') {
        currentEvaluation.value = {
          id: 'eval_001',
          outfitId: '001',
          userId: userId,
          rating: 4,
          comment: '这套搭配很适合我的风格，舒适又好看。',
          createdAt: '2023-03-12T14:30:00Z',
          updatedAt: '2023-03-12T14:30:00Z'
        }
      } else if (outfitId === '002') {
        currentEvaluation.value = {
          id: 'eval_002',
          outfitId: '002',
          userId: userId,
          rating: 5,
          comment: '非常专业的形象，穿上后获得了很多好评。',
          createdAt: '2023-03-17T09:15:00Z',
          updatedAt: '2023-03-17T09:15:00Z'
        }
      } else {
        // 对于其他ID，返回null表示没有评价
        currentEvaluation.value = null
      }
      
      return currentEvaluation.value
    } catch (error) {
      console.error('获取穿搭评价失败', error)
      throw error
    }
  }

  // 提交穿搭评价
  const submitEvaluation = async (evaluationData) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 确保评分和评价是一体的
      if (!evaluationData.score || evaluationData.score === 0) {
        console.error('提交评价失败：评分不能为空')
        return false
      }
      
      // 创建新评价 - 统一使用后端字段名
      const newEvaluation = {
        id: `eval_${Date.now()}`,
        outfitId: evaluationData.outfitId,
        userId: evaluationData.userId,
        score: parseInt(evaluationData.score || 0),
        comment: evaluationData.comment || '',
        createTime: new Date().toISOString()
      }
      
      // 更新当前评价
      currentEvaluation.value = newEvaluation
      
      // 更新对应穿搭的评分
      const outfitIndex = outfits.value.findIndex(o => o.id === evaluationData.outfitId)
      if (outfitIndex !== -1) {
        const scoreValue = parseInt(evaluationData.score || 0)
        
        console.log(`正在更新穿搭 ${evaluationData.outfitId} 的评分为 ${scoreValue}`)
        
        // 直接更新穿搭数据结构中的评价信息 - 与后端结构保持一致
        outfits.value[outfitIndex] = {
          ...outfits.value[outfitIndex],
          score: scoreValue,
          comment: evaluationData.comment || '',
          evaluationTime: new Date().toISOString()
        }
        
        // 如果当前查看的是这条记录，也更新currentOutfit
        if (currentOutfit.value && currentOutfit.value.id === evaluationData.outfitId) {
          // 同样地完整更新当前查看的穿搭对象
          currentOutfit.value = {
            ...currentOutfit.value,
            score: scoreValue,
            comment: evaluationData.comment || '',
            evaluationTime: new Date().toISOString()
          }
        }
        
        // 保存到Session Storage和本地存储
        saveToSession()
        saveToStorage()
      }
      
      // 通知数据变更
      notifyDataChange('update', newEvaluation)
      
      return true
    } catch (error) {
      console.error('提交穿搭评价失败', error)
      return false
    }
  }

  // 删除穿搭记录
  const deleteOutfit = async (outfitId) => {
    try {
      // TODO: 当API可用时，取消注释下面的代码
      // await deleteOutfitRecord(outfitId)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 从列表中移除
      outfits.value = outfits.value.filter(o => o.id !== outfitId)
      
      // 如果当前查看的是这条记录，清空currentOutfit
      if (currentOutfit.value && currentOutfit.value.id === outfitId) {
        currentOutfit.value = null
        currentEvaluation.value = null
      }
      
      // 保存到Session Storage
      saveToSession()
      
      // 更新本地持久化存储
      saveToStorage()
      
      // 通知数据变更
      notifyDataChange('delete', { id: outfitId })
      
      return true
    } catch (error) {
      console.error('删除穿搭记录失败', error)
      return false
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

  // 生成模拟的穿搭记录数据 - 符合 API 结构
  const generateMockOutfits = (userId, count = 5) => {
    const outfits = [];
    const now = new Date();
    
    // 使用更可靠的图片源
    const imageUrls = [
      'https://picsum.photos/400/500?random=1',
      'https://picsum.photos/400/500?random=2',
      'https://picsum.photos/400/500?random=3',
      'https://picsum.photos/400/500?random=4',
      'https://picsum.photos/400/500?random=5'
    ];
    
    const scenes = ['商务正式', '休闲日常', '约会', '运动', '派对'];
    
    for (let i = 0; i < count; i++) {
      const createdAt = new Date(now);
      createdAt.setDate(now.getDate() - i);
      
      // 使用循环获取图片和场景
      const imageIndex = i % imageUrls.length;
      const sceneIndex = i % scenes.length;
      const scene = scenes[sceneIndex];
      
      // 是否是休闲场景
      const isCasual = scene === '休闲日常' || scene === '运动';
      
      // 构建符合API结构的数据
      const outfitData = {
        top: isCasual ? '简约白色T恤，搭配浅蓝色休闲衬衫作为外层' : '浅蓝色修身衬衫，配深色西装外套',
        bottom: isCasual ? '直筒深蓝色牛仔裤，裤长合适，略微修身' : '藏青色修身西裤，面料挺括有质感',
        accessories: isCasual ? '灰色低帮帆布鞋，搭配简约棕色皮带和银色手表' : '棕色牛津鞋，配同色系皮带和金色袖扣',
        keyPoints: isCasual 
          ? ['整体色调协调，蓝白灰色系清爽自然', '宽松但不松垮，保持整洁有型的整体感', '适合休闲场合，同时兼具简约时尚气质'] 
          : ['整体造型正式得体，色彩搭配协调', '合身剪裁突显专业感', '细节处理精致，提升整体质感']
      };
      
      // 生成评分和评论
      const hasEvaluation = Math.random() > 0.3; // 70%的记录有评价
      const score = hasEvaluation ? Math.floor(Math.random() * 5) + 1 : 0;
      const comment = hasEvaluation
        ? (isCasual 
            ? '舒适自然的日常搭配，非常适合我的风格。' 
            : '很正式的商务装扮，参加会议很有面子。')
        : '';
      
      // 创建标准格式的数据 - 严格按照后端数据结构
      outfits.push({
        id: `outfit_${Date.now() - i * 1000}`, // 确保ID唯一
        userId: userId,
        outfitDescription: JSON.stringify(outfitData), // 将结构化数据转为字符串存储
        aiPromptDescription: `young ${isCasual ? 'casual' : 'business'} outfit with ${isCasual ? 'white t-shirt, blue shirt' : 'blue dress shirt, dark suit jacket'}, ${isCasual ? 'dark jeans' : 'navy dress pants'}, professional look, high quality`,
        outfitImageUrl: imageUrls[imageIndex],
        requirementText: `这是一套适合${scene}的穿搭方案，结合了时尚元素和${isCasual ? '舒适度' : '专业感'}。`,
        sceneId: scene,
        highlightImageUrl: '', // 添加后端字段，暂时为空
        createTime: createdAt.toISOString(),
        score: score,
        comment: comment
      });
    }
    
    return outfits;
  };

  // 添加新的穿搭记录
  const addOutfit = async (outfitData) => {
    try {
      // 标准化数据格式
      const outfit = standardizeOutfitData(outfitData)
      
      // 添加到数组开头，确保最新的记录在前面
      outfits.value.unshift(outfit)
      
      // 将数据持久化到本地存储
      saveToStorage()
      
      // 通知数据变更
      notifyDataChange('add', outfit)
      
      return true
    } catch (error) {
      console.error('添加穿搭记录失败', error)
      return false
    }
  }

  // 通知数据变更
  const notifyDataChange = (type, data) => {
    emitter.emit('outfit-data-change', { type, data })
  }

  // 订阅变更的方法
  const onDataChange = (callback) => {
    emitter.on('outfit-data-change', callback)
    return () => emitter.off('outfit-data-change', callback)
  }

  // 初始化，从session加载数据
  loadFromSession()

  // 添加初始化方法
  const initStore = () => {
    try {
      const restored = restoreFromStorage()
      if (!restored) {
        // 如果本地没有数据或数据为空，从API获取
        fetchOutfitRecords()
      }
    } catch (error) {
      console.error('从本地存储加载穿搭记录失败', error)
    }
  }

  // 标准化数据格式 - 确保与后端 OutfitRecommendVO 一致
  const standardizeOutfitData = (data) => {
    // 如果已经是标准格式，确保字段名称与后端一致
    if (data.outfitDescription && data.aiPromptDescription && data.outfitImageUrl) {
      return {
        ...data,
        // 确保必要字段存在
        id: data.id || `outfit_${Date.now()}`,
        createTime: data.createTime || data.createdAt || new Date().toISOString(),
        // 评分处理：undefined、null、0 都表示未评价
        score: data.score !== undefined && data.score !== null && data.score > 0 ? data.score : null,
        comment: data.comment || ''
      }
    }
    
    // 转换为标准格式
    return {
      id: data.id || `outfit_${Date.now()}`,
      userId: data.userId || '',
      // 确保描述不被截断 - 如果是对象则序列化，否则直接使用
      outfitDescription: typeof data.outfitDescription === 'object' 
        ? JSON.stringify(data.outfitDescription) 
        : (data.outfitDescription || (data.outfitData ? JSON.stringify(data.outfitData) : '')),
      aiPromptDescription: data.aiPromptDescription || data.aiDescription || '',
      outfitImageUrl: data.outfitImageUrl || data.imageUrl || '',
      requirementText: data.requirementText || data.description || '',
      sceneId: data.sceneId || '',
      createTime: data.createTime || data.createdAt || new Date().toISOString(),
      // 明确处理未评价情况
      score: data.score !== undefined && data.score !== null && data.score > 0 ? data.score : null,
      comment: data.comment || ''
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
    fetchOutfitRecords,
    fetchOutfitDetail,
    fetchOutfitEvaluation,
    submitEvaluation,
    deleteOutfit,
    setCurrentOutfit,
    clearCurrentOutfit,
    loadFromSession,
    saveToSession,
    addOutfit,
    notifyDataChange,
    // 订阅变更的方法
    onDataChange,
    saveToStorage,
    restoreFromStorage,
    // 添加初始化方法
    initStore,
    standardizeOutfitData
  }
}) 