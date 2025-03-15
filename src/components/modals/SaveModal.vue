<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
      <div class="p-4 border-b">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-800">保存穿搭方案</h3>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <!-- 评分 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">您的评分</label>
          <div class="flex justify-center">
            <div class="rating">
              <div 
                v-for="n in 5" 
                :key="n" 
                class="star-container"
                @click="updateRating(n)"
              >
                <i class="fas fa-star text-2xl" :class="rating >= n ? 'text-yellow-400' : 'text-gray-300'"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 评价内容 -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
          <textarea 
            v-model="commentText" 
            class="w-full border border-gray-300 rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            placeholder="分享您对这套穿搭的看法..."
            rows="4"
          ></textarea>
        </div>
      </div>
      
      <div class="p-4 border-t flex justify-end space-x-3">
        <button 
          @click="$emit('cancel')" 
          class="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-150 text-sm font-medium"
        >
          取消
        </button>
        <button 
          @click="handleLater()" 
          class="px-5 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition duration-150 text-sm font-medium"
        >
          稍后评价
        </button>
        
        <button 
          @click="handleSave()" 
          class="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 text-sm font-medium"
        >
          保存并评价
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'SaveModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialRating: {
      type: Number,
      default: 0
    },
    initialComment: {
      type: String,
      default: ''
    }
  },
  
  emits: ['update:show', 'save', 'later', 'cancel'],
  
  setup(props, { emit }) {
    // 评分和评论
    const rating = ref(props.initialRating)
    const commentText = ref(props.initialComment)
    
    // 更新评分
    const updateRating = (value) => {
      rating.value = value
    }
    
    // 保存并提交评价
    const handleSave = () => {
      emit('save', {
        rating: rating.value,
        comment: commentText.value
      })
    }
    
    // 稍后评价
    const handleLater = () => {
      emit('later')
    }
    
    // 当props变化时更新本地状态
    watch(() => props.initialRating, (newVal) => {
      rating.value = newVal
    })
    
    watch(() => props.initialComment, (newVal) => {
      commentText.value = newVal
    })
    
    return {
      rating,
      commentText,
      updateRating,
      handleSave,
      handleLater
    }
  }
}
</script>

<style scoped>
.rating {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.star-container {
  cursor: pointer;
  padding: 4px;
  transition: transform 0.15s ease-in-out;
}

.star-container:hover {
  transform: scale(1.15);
}

.star-container i {
  transition: color 0.15s ease;
}

/* 添加过渡动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 