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
        <router-link 
          v-for="review in reviews" 
          :key="review.userId + review.imagePath" 
          :to="`/upload-outfit?id=${review.userId}&image=${review.imagePath}`" 
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
        </router-link>
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
// TODO: 取消注释以使用真实API
// import { getFashionEvaluations } from '@/api/outfit'

export default {
  name: 'AIReviewView',
  components: {
    SubPageNavBar
  },
  data() {
    return {
      reviews: [],
      loading: false,
      error: null
    }
  },
  created() {
    this.fetchEvaluations()
  },
  methods: {
    async fetchEvaluations() {
      // 获取用户ID，实际项目中应该从本地存储或Vuex中获取
      const userId = localStorage.getItem('userId') || '1'
      
      this.loading = true
      this.error = null
      
      try {
        // TODO: 取消注释以使用真实API调用
        // const result = await getFashionEvaluations(userId)
        // this.reviews = result || []
        
        // 模拟API响应数据
        setTimeout(() => {
          this.reviews = this.getMockEvaluations(userId)
          this.loading = false
        }, 800) // 模拟网络延迟
      } catch (err) {
        console.error('获取穿搭评价失败:', err)
        this.error = '获取评价记录失败，请稍后再试'
        this.loading = false
      }
    },
    
    // 模拟评价数据
    getMockEvaluations(userId) {
      return [
        {
          userId: userId,
          imagePath: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=200&h=200&fit=crop',
          description: '整体搭配简约干净，休闲中带有活力感。建议可以尝试戴一顶棒球帽或选择亮色系的运动鞋来增加层次感和个性，让整体造型更加突出。',
          advantages: '色彩搭配和谐，整体风格统一',
          disadvantages: '配饰缺乏亮点，层次感不足',
          suggestions: '可以添加一些亮色点缀，如鲜艳的领带或口袋巾',
          score: 8.5,
          createdTime: '2023-10-15T12:30:00'
        },
        {
          userId: userId,
          imagePath: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&h=200&fit=crop',
          description: '这套商务休闲风格穿搭非常得体，色彩搭配和谐。建议可以选择深色系的皮鞋和皮带来呼应上衣，并考虑增加口袋巾等细节，提升整体质感。',
          advantages: '商务休闲风格把握精准，细节考究',
          disadvantages: '颜色偏暗沉，缺少亮点',
          suggestions: '可以考虑通过领带或袖扣增加一些亮色点缀',
          score: 9.2,
          createdTime: '2023-10-10T09:15:00'
        },
        {
          userId: userId,
          imagePath: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=200&h=200&fit=crop',
          description: '简约单色系穿搭，整体效果清爽利落。可以考虑增加配饰如项链或手表增强细节，选择纹理感面料提升质感。',
          advantages: '简约时尚，干净利落',
          disadvantages: '略显单调，个性不够突出',
          suggestions: '建议增加一些配饰，如项链或胸针增加亮点',
          score: 7.8,
          createdTime: '2023-10-05T15:45:00'
        }
      ]
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