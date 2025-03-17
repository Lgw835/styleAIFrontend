<template>
  <div class="ai-review">
    <!-- 使用SubPageNavBar组件 -->
    <SubPageNavBar 
      title="AI评价记录" 
      :back-link="'/'"
    />

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 添加顶部刷新按钮 -->
      <div class="flex justify-end px-4 py-2">
        <button 
          @click="refreshData" 
          class="text-blue-500 flex items-center text-sm"
          :disabled="outfitStore.loading"
        >
          <i class="fas fa-sync-alt mr-1" :class="{'animate-spin': outfitStore.loading}"></i>
          刷新数据
        </button>
      </div>

      <!-- 如果是详情模式，显示详情内容 -->
      <div v-if="showDetail" class="detail-view">
        <div class="detail-container">
          <!-- 评价图片 -->
          <div class="detail-image-container">
            <img :src="currentReview.imagePath || currentReview.url || currentReview.fileUrl" 
                 class="detail-image" alt="穿搭图片">
          </div>
          
          <!-- 总体评分 -->
          <div class="score-section">
            <h3 class="section-title">总体评分</h3>
            <div class="score-circle">
              <span class="score-number">{{ currentReview.score || 0 }}</span>
            </div>
          </div>
          
          <!-- 图片描述 -->
          <div class="description-section">
            <h3 class="section-title">
              <i class="fas fa-image mr-2"></i>图片描述
            </h3>
            <p class="description-text">{{ currentReview.description || '暂无描述' }}</p>
          </div>
          
          <!-- 穿搭优点 -->
          <div class="advantages-section" v-if="currentReview.advantages || currentReview.pros">
            <h3 class="section-title">
              <i class="fas fa-thumbs-up mr-2"></i>穿搭优点
            </h3>
            <p class="advantages-text">{{ currentReview.advantages || currentReview.pros || '暂无优点分析' }}</p>
          </div>
          
          <!-- 穿搭缺点 -->
          <div class="disadvantages-section" v-if="currentReview.disadvantages || currentReview.cons">
            <h3 class="section-title">
              <i class="fas fa-thumbs-down mr-2"></i>穿搭缺点
            </h3>
            <p class="disadvantages-text">{{ currentReview.disadvantages || currentReview.cons || '暂无缺点分析' }}</p>
          </div>
          
          <!-- 穿搭建议 -->
          <div class="suggestions-section" v-if="currentReview.suggestions || currentReview.recommendations">
            <h3 class="section-title">
              <i class="fas fa-lightbulb mr-2"></i>穿搭建议
            </h3>
            <p class="suggestions-text">{{ currentReview.suggestions || currentReview.recommendations || '暂无穿搭建议' }}</p>
          </div>
          
          <!-- 风格分析 -->
          <div class="style-section" v-if="currentReview.styleAnalysis || currentReview.styleType">
            <h3 class="section-title">
              <i class="fas fa-tshirt mr-2"></i>风格分析
            </h3>
            <p class="style-text">{{ currentReview.styleAnalysis || currentReview.styleType || '暂无风格分析' }}</p>
          </div>
          
          <!-- 整体评价 -->
          <div class="overall-section" v-if="currentReview.overallEvaluation || currentReview.conclusion">
            <h3 class="section-title">
              <i class="fas fa-star mr-2"></i>整体评价
            </h3>
            <p class="overall-text">{{ currentReview.overallEvaluation || currentReview.conclusion || '暂无整体评价' }}</p>
          </div>
          
          <!-- 评价时间 -->
          <div class="time-section">
            <p class="time-text">评价时间: {{ formatDate(currentReview.createdAt) }}</p>
          </div>
          
          <!-- 返回按钮 -->
          <button @click="closeDetail" class="back-button">
            <i class="fas fa-arrow-left mr-2"></i>返回列表
          </button>
        </div>
      </div>
      
      <!-- 列表视图 - 和原来的内容相同，但增加v-else -->
      <div v-else>
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="flex flex-col items-center justify-center h-full px-4 py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-sm text-gray-400">正在加载评价记录...</p>
          </div>
        </div>
        
        <!-- 空状态提示 - 移到error之前，优先判断是否有数据 -->
        <div v-else-if="evaluations.length === 0" class="empty-state">
          <div class="flex flex-col items-center justify-center h-full px-4 py-12">
            <i class="fas fa-tshirt text-6xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-500 mb-2">暂无穿搭评价</h3>
            <p class="text-sm text-gray-400 text-center mb-6">上传一张穿搭照片，获取AI专业点评</p>
            <button @click="uploadNewOutfit" class="btn-primary py-2 px-6 rounded-lg">
              <i class="fas fa-camera mr-2"></i>上传穿搭照片
            </button>
          </div>
        </div>
        
        <!-- 错误提示 - 仅当有错误且有内容时显示 -->
        <div v-else-if="error && error !== '获取评价记录失败'" class="error-container">
          <div class="flex flex-col items-center justify-center h-full px-4 py-12">
            <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
            <p class="text-sm text-red-400">{{ error }}</p>
            <button @click="fetchEvaluations" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              重新加载
            </button>
          </div>
        </div>
        
        <!-- 评价记录列表 - 水平布局 -->
        <div v-else class="reviews-list px-4 py-3">
          <!-- 评价记录列表，显示分页后的数据 -->
          <div 
            v-for="review in evaluations" 
            :key="review.userId + review.imagePath"
            @click="viewEvaluation(review)" 
            class="review-card"
          >
            <!-- 左侧：图片和日期 -->
            <div class="review-left">
              <div class="review-image-wrapper">
                <img :src="review.imagePath || review.url || review.fileUrl" class="review-image" alt="穿搭图片">
              </div>
              <div class="review-date">
                <i class="far fa-calendar-alt mr-1"></i>
                {{ formatDate(review.createdAt || review.createdTime) }}
              </div>
            </div>
            
            <!-- 右侧：评分和AI评价 -->
            <div class="review-right">
              <div class="review-score">{{ review.score }}</div>
              <div class="ai-comment">
                <div class="ai-label">
                  <i class="fas fa-robot mr-1"></i> AI点评
                </div>
                <p class="ai-comment-text">{{ review.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- 加载更多提示器 -->
          <div v-if="hasMoreData || loading" class="loading-more-indicator py-4 text-center">
            <div v-if="loading" class="animate-pulse flex justify-center items-center">
              <i class="fas fa-circle-notch fa-spin mr-2 text-gray-400"></i>
              <span class="text-sm text-gray-500">加载更多...</span>
            </div>
            <div v-else class="text-sm text-gray-400">
              上滑加载更多
            </div>
          </div>
          
          <!-- 全部加载完毕提示 -->
          <div v-if="!hasMoreData && evaluations.length > pageSize" class="all-loaded py-4 text-center">
            <div class="text-sm text-gray-400">— 已显示全部评价 —</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮添加按钮 - 仅在非详情模式显示 -->
    <div v-if="!showDetail" class="floating-button" @click="uploadNewOutfit">
      <i class="fas fa-plus"></i>
    </div>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useOutfitStore } from '@/stores/outfitStore'
import { useUserStore } from '@/stores/user'
import { onMounted, onActivated, ref, computed, nextTick, onUnmounted } from 'vue'

export default {
  name: 'AIReviewView',
  components: {
    SubPageNavBar
  },
  setup() {
    const outfitStore = useOutfitStore()
    const userStore = useUserStore()
    
    // 检查数据刷新需求的函数
    const checkAndRefreshData = async () => {
      console.log('检查 AI 评价数据是否需要刷新...')
      
      // 调用store中的评价获取方法，完整实现优先级顺序
      // 1. pinia缓存 -> 2. 持久化存储 -> 3. API请求
      await outfitStore.fetchEvaluations(false)
      
      console.log('数据加载完成，当前评价数量:', outfitStore.evaluations.length)
    }
    
    // 页面首次加载
    onMounted(async () => {
      console.log('AIReviewView 组件已挂载，初始化数据')
      await checkAndRefreshData()
      
      // 添加调试输出
      console.log('挂载后评价数据:', outfitStore.evaluations)
    })
    
    // 页面被激活时（从其他页面返回）
    onActivated(async () => {
      console.log('AIReviewView 组件被激活，检查数据更新')
      await checkAndRefreshData()
    })
    
    return {
      outfitStore,
      userStore,
      refreshData: checkAndRefreshData
    }
  },
  data() {
    return {
      // 添加分页相关状态
      pageSize: 5,        // 每页显示数量
      currentPage: 1,     // 当前页码
      loading: false,     // 是否正在加载更多
      hasMoreData: true,  // 是否还有更多数据
      activeTab: 0,
      showDetail: false,
      currentReview: null,
      // 用于检测滚动到底部的距理
      bottomOffset: 200
    }
  },
  computed: {
    // 获取排序后的所有评价记录 
    sortedEvaluations() {
      // 按创建时间排序
      return [...this.outfitStore.evaluations]
        .sort((a, b) => {
          // 使用createdAt字段，同时兼容其他可能的时间字段
          const timeA = new Date(a.createdAt || a.createdTime || a.createTime || 0).getTime();
          const timeB = new Date(b.createdAt || b.createdTime || b.createTime || 0).getTime();
          // 降序排列 - 最新的在前面
          return timeB - timeA;
        });
    },
    
    // 当前页显示的数据（虚拟分页）
    evaluations() {
      // 计算当前应该显示的记录
      const end = this.currentPage * this.pageSize;
      const paginatedData = this.sortedEvaluations.slice(0, end);
      
      // 更新是否还有更多数据
      this.hasMoreData = end < this.sortedEvaluations.length;
      
      console.log(`显示前${end}条记录，共${this.sortedEvaluations.length}条`);
      return paginatedData;
    },
    
    // 判断是否有数据
    hasEvaluations() {
      return this.sortedEvaluations.length > 0
    },
    
    // 格式化日期方法保持不变
    loading() {
      return this.outfitStore.loading
    },
    error() {
      return this.outfitStore.error
    }
  },
  methods: {
    // 查看评价详情 - 修改为在当前页面显示详情
    viewEvaluation(review) {
      // 设置当前评价并显示详情视图
      this.currentReview = {
        ...review,
        imagePath: review.imagePath || review.url || review.fileUrl,
        
        // 确保所有可能的评价字段都被考虑
        // 图片描述可能的字段
        description: review.description || review.imageDescription || review.content || '',
        
        // 优点可能的字段
        advantages: review.advantages || review.pros || review.positivePoints || '',
        
        // 缺点可能的字段
        disadvantages: review.disadvantages || review.cons || review.negativePoints || '',
        
        // 建议可能的字段
        suggestions: review.suggestions || review.recommendations || review.advice || '',
        
        // 风格分析可能的字段
        styleAnalysis: review.styleAnalysis || review.styleType || review.fashionStyle || '',
        
        // 整体评价可能的字段
        overallEvaluation: review.overallEvaluation || review.conclusion || review.summary || ''
      }
      
      // 打印评价详情，方便调试
      console.log('当前查看的评价详情:', this.currentReview)
      
      this.showDetail = true
      
      // 滚动到顶部
      window.scrollTo(0, 0)
    },
    
    // 关闭详情视图
    closeDetail() {
      this.showDetail = false
      this.currentReview = null
    },
    
    // 上传新穿搭按钮
    uploadNewOutfit() {
      console.log('跳转到上传穿搭页面')
      this.$router.push('/upload-outfit')
    },
    
    async fetchEvaluations() {
      // 调用store的方法刷新数据
      await this.outfitStore.fetchEvaluations()
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '未知日期'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch (e) {
        return '未知日期'
      }
    },
    
    // 处理滚动事件，实现无限滚动加载
    handleScroll() {
      // 如果正在加载、没有更多数据或者在详情页，则不处理
      if (this.loading || !this.hasMoreData || this.showDetail) return;
      
      // 检查是否滚动到底部附近
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 当滚动到距离底部一定距离时加载更多
      if (scrollPosition + windowHeight >= documentHeight - this.bottomOffset) {
        this.loadMoreData();
      }
    },
    
    // 加载更多数据
    loadMoreData() {
      if (this.loading || !this.hasMoreData) return;
      
      this.loading = true;
      console.log('加载更多数据...');
      
      // 模拟异步加载，实际上是增加页码来显示更多已加载的数据
      setTimeout(() => {
        this.currentPage++;
        this.loading = false;
        console.log(`页码增加到 ${this.currentPage}，显示 ${this.pageSize * this.currentPage} 条记录`);
      }, 500);
    }
  },
  mounted() {
    // 添加滚动事件监听
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    // 移除滚动事件监听，防止内存泄漏
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>
.ai-review {
  min-height: 100vh;
  background-color: #F5F5F5;
}

.content-container {
  padding-top: 56px;
  padding-bottom: 80px;
  min-height: calc(100vh - 56px);
  overflow-y: auto;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 12px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
}

.review-card:active {
  transform: scale(0.98);
}

/* 左侧样式 */
.review-left {
  flex: 0 0 110px;
  margin-right: 12px;
}

.review-image-wrapper {
  width: 110px;
  height: 110px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
}

.review-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-date {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 右侧样式 */
.review-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.review-score {
  font-size: 16px;
  font-weight: bold;
  color: #4096FF;
  margin-bottom: 6px;
}

.ai-label {
  font-size: 13px;
  font-weight: 600;
  color: #4096FF;
  margin-bottom: 4px;
}

.ai-comment-text {
  font-size: 14px;
  color: #444;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4096FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 100;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.floating-button:active {
  transform: scale(0.95);
  background-color: #3086EE;
}

.btn-primary {
  background-color: #4096FF;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.empty-state, .loading-container, .error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #888;
}

/* 添加详情视图样式 */
.detail-view {
  padding: 20px;
}

.detail-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.detail-image-container {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  object-fit: cover;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4096FF;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 30px;
  font-weight: bold;
  margin: 10px 0;
}

/* 各评价部分通用样式 */
.description-section, .advantages-section, .disadvantages-section, 
.suggestions-section, .style-section, .overall-section {
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.advantages-section {
  background-color: #f0f8f0;
}

.disadvantages-section {
  background-color: #fff0f0;
}

.suggestions-section {
  background-color: #f0f0ff;
}

.time-section {
  margin-top: 16px;
  text-align: right;
}

.time-text {
  font-size: 12px;
  color: #888;
}

.back-button {
  width: 100%;
  padding: 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: #333;
  margin-top: 20px;
}

/* 加载更多指示器样式 */
.loading-more-indicator {
  padding: 1rem 0;
  margin-top: 0.5rem;
  border-top: 1px dashed #eee;
}

/* 加载动画效果 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 全部加载完毕提示样式 */
.all-loaded {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
}
</style> 