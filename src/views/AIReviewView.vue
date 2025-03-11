<template>
  <div class="ai-review">
    <!-- 使用SubPageNavBar组件 -->
    <SubPageNavBar 
      title="评价记录" 
      :back-link="'/'"
    />

    <!-- 内容区域 -->
    <div class="content-container">
      <div class="px-4">
        <!-- AI评价记录卡片 -->
        <div v-for="review in reviews" :key="review.date" class="p-4 bg-white rounded-xl shadow-sm mt-4">
          <a href="#" class="block">
            <div class="flex mb-3">
              <img :src="review.avatar" class="w-8 h-8 rounded-full" alt="用户头像">
              <div class="ml-2">
                <div class="text-sm font-medium">{{ review.username }}</div>
                <div class="text-xs text-gray-500">{{ review.date }}</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-3">
              <img :src="review.image" 
                   class="w-full h-24 object-cover rounded-lg" alt="穿搭图片">
              <div class="col-span-2">
                <div class="text-sm text-gray-600 line-clamp-2">
                  {{ review.description }}
                </div>
              </div>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <h3 class="text-sm font-medium mb-1 text-gray-800">AI点评</h3>
              <p class="text-xs text-gray-600 leading-relaxed">{{ review.aiComment }}</p>
            </div>
          </a>
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

export default {
  name: 'AIReviewView',
  components: {
    SubPageNavBar
  },
  data() {
    return {
      reviews: [
        {
          username: '我的穿搭',
          date: '2023-10-15',
          avatar: 'https://i.pravatar.cc/40?img=3',
          image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=200&h=200&fit=crop',
          description: '灰色连帽卫衣搭配黑色运动裤，简约时尚的运动休闲风格，适合日常运动或周末休闲活动。',
          aiComment: '整体搭配简约干净，休闲中带有活力感。建议可以尝试戴一顶棒球帽或选择亮色系的运动鞋来增加层次感和个性，让整体造型更加突出。'
        },
        {
          username: '我的穿搭',
          date: '2023-10-10',
          avatar: 'https://i.pravatar.cc/40?img=3',
          image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&h=200&fit=crop',
          description: '深蓝色西装外套搭配米色休闲裤，既保持了职业感又不失舒适度。',
          aiComment: '这套商务休闲风格穿搭非常得体，色彩搭配和谐。建议可以选择深色系的皮鞋和皮带来呼应上衣，并考虑增加口袋巾等细节，提升整体质感。'
        }
      ]
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

.content-container::-webkit-scrollbar {
  width: 4px;
}

.content-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 