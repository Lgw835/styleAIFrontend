<template>
  <div class="ai-review">
    <!-- 使用SubPageNavBar组件 -->
    <SubPageNavBar 
      title="AI评价记录" 
      :back-link="'/'"
    />

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="flex flex-col items-center justify-center h-full px-4 py-12">
          <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p class="text-sm text-gray-400">正在加载评价记录...</p>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-else-if="error" class="error-container">
        <div class="flex flex-col items-center justify-center h-full px-4 py-12">
          <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
          <p class="text-sm text-red-400">{{ error }}</p>
          <button @click="fetchEvaluations" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            重新加载
          </button>
        </div>
      </div>
      
      <!-- 空状态提示 -->
      <div v-else-if="reviews.length === 0" class="empty-state">
        <div class="flex flex-col items-center justify-center h-full px-4 py-12">
          <i class="fas fa-tshirt text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-500 mb-2">暂无穿搭评价</h3>
          <p class="text-sm text-gray-400 text-center mb-6">上传一张穿搭照片，获取AI专业点评</p>
          <router-link to="/upload-outfit" class="btn-primary py-2 px-6 rounded-lg">
            上传第一张穿搭
          </router-link>
        </div>
      </div>
      
      <!-- 评价记录列表 - 水平布局 -->
      <div v-else class="reviews-list px-4 py-3">
        <div 
          v-for="review in reviews" 
          :key="review.userId + review.imagePath"
          @click="viewEvaluation(review)" 
          class="review-card"
        >
          <!-- 左侧：图片和日期 -->
          <div class="review-left">
            <div class="review-image-wrapper">
              <img :src="review.imagePath" class="review-image" alt="穿搭图片">
            </div>
            <div class="review-date">
              <i class="far fa-calendar-alt mr-1"></i>
              {{ formatDate(review.createdTime) }}
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
      </div>
    </div>

    <!-- 悬浮添加按钮 -->
    <router-link to="/upload-outfit" class="floating-button">
      <i class="fas fa-plus"></i>
    </router-link>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useOutfitStore } from '@/stores/outfitStore'
// TODO: 取消注释以使用真实API
// import { getFashionEvaluations } from '@/api/outfit'

export default {
  name: 'AIReviewView',
  components: {
    SubPageNavBar
  },
  data() {
    return {
      // 不再在组件内存储reviews数据
    }
  },
  created() {
    // 使用store的方法获取评价列表，优先使用sessionStorage中的数据
    this.outfitStore.fetchEvaluations()
  },
  computed: {
    // 从store中获取数据
    outfitStore() {
      return useOutfitStore()
    },
    reviews() {
      return this.outfitStore.evaluations
    },
    loading() {
      return this.outfitStore.loading
    },
    error() {
      return this.outfitStore.error
    }
  },
  methods: {
    async fetchEvaluations() {
      // 调用store的方法刷新数据
      await this.outfitStore.fetchEvaluations()
    },
    
    // 点击评价记录时设置当前评价并导航
    viewEvaluation(review) {
      // 设置当前选中的评价
      this.outfitStore.setCurrentEvaluation(review)
      
      // 导航到上传页面，仍然带上id和image参数作为备用
      this.$router.push(`/upload-outfit?id=${review.userId}&image=${review.imagePath}`)
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
    }
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
  bottom: 30px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #4096FF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
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
</style> 