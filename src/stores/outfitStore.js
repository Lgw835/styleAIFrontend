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
    
    // 增强从sessionStorage加载数据的方法
    loadFromSessionStorage() {
      try {
        // 只从sessionStorage读取数据
        const storedData = sessionStorage.getItem(EVALUATION_STORAGE_KEY)
        
        if (storedData) {
          console.log('从SessionStorage找到持久化数据');
          
          // 解析存储的数据
          const parsedData = JSON.parse(storedData);
          
          // 检查数据结构 - 兼容新旧两种格式
          if (Array.isArray(parsedData)) {
            // 旧格式 - 直接是数组
            this.evaluations = parsedData;
          } else if (parsedData && parsedData.evaluations) {
            // 新格式 - 包含evaluations属性的对象
            this.evaluations = parsedData.evaluations || [];
            this.lastEvaluationFetchTime = parsedData.lastEvaluationFetchTime || null;
          } else {
            // 无效数据
            console.warn('SessionStorage中的数据格式无效');
            this.evaluations = [];
            return false;
          }
          
          console.log('成功从SessionStorage加载评价数据，数量:', this.evaluations.length);
          return this.evaluations.length > 0;
        }
      } catch (err) {
        console.error('从SessionStorage加载数据失败:', err);
        this.evaluations = [];
      }
      return false;
    },
    
    // 增强保存到sessionStorage的方法
    saveToSessionStorage() {
      try {
        const dataToSave = {
          evaluations: this.evaluations,
          lastEvaluationFetchTime: this.lastEvaluationFetchTime
        }
        
        // 打印保存的数据以便调试
        console.log('保存到sessionStorage的评价数据:', dataToSave)
        
        // 只保存到sessionStorage
        sessionStorage.setItem(EVALUATION_STORAGE_KEY, JSON.stringify(dataToSave))
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
      if (this.evaluations && this.evaluations.length > 0) {
        console.log('使用pinia中已有的评价数据，数量:', this.evaluations.length);
        
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
        console.log('从session存储加载到数据，数量:', this.evaluations.length);
        
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
      // 获取用户信息
      const userStore = useUserStore();
      if (!userStore.isLoggedIn) {
        console.log('用户未登录，不获取评价数据');
        this.evaluations = [];
        return;
      }
      
      this.loading = true;
      
      try {
        console.log('从API获取评价记录，用户ID:', userStore.userInfo.userId);
        
        // 发出API请求
        const response = await getFashionEvaluations(userStore.userInfo.userId);
        console.log('API响应完整数据:', response);
        
        // 初始化评价数组
        let evaluationData = [];
        
        // 处理各种可能的响应格式
        if (response && response.success === true) {
          // 标准成功响应
          evaluationData = Array.isArray(response.data) ? response.data : [];
          console.log('从标准响应中提取数据，条目数:', evaluationData.length);
        } else if (Array.isArray(response)) {
          // 直接返回数组的情况
          evaluationData = response;
          console.log('API直接返回数组数据，条目数:', evaluationData.length);
        } else if (response && response.data && Array.isArray(response.data)) {
          // 只有data字段但没有success标志的情况
          evaluationData = response.data;
          console.log('从data字段提取数组数据，条目数:', evaluationData.length);
        }
        
        // 一定要打印原始数据看看结构
        console.log('提取的原始评价数据:', evaluationData);
        
        // 处理并标准化评价数据
        if (evaluationData.length > 0) {
          this.evaluations = evaluationData.map(item => ({
            ...item,
            // 标准化图片路径
            imagePath: item.imagePath || item.url || item.fileUrl || '',
            // 标准化创建时间 - 修改为使用createdAt
            createdAt: item.createdAt || item.createdTime || item.createTime || new Date().toISOString()
          }));
          
          // 记录更新时间
          this.lastEvaluationFetchTime = Date.now();
          
          // 保存到存储
          this.saveToSessionStorage();
          console.log('已更新评价数据并保存到会话存储，条目数:', this.evaluations.length);
        } else {
          console.log('API返回空数据，显示空状态');
          this.evaluations = [];
          
          // 即使是空数据也更新时间，避免频繁请求
          this.lastEvaluationFetchTime = Date.now();
          this.saveToSessionStorage();
        }
      } catch (error) {
        console.error('获取评价数据时出错:', error);
        // 保持evaluations不变，可能有旧数据
      } finally {
        this.loading = false;
        console.log('评价数据获取完成，最终结果条目数:', this.evaluations.length);
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