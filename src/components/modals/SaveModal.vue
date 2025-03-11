<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-xl w-11/12 max-w-lg p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">保存并评价</h3>
        <button class="text-gray-500" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="mb-4">
        <p class="text-sm text-gray-600 mb-2">请为此次穿搭推荐评分：</p>
        <div class="rating mb-4">
          <template v-for="n in 5" :key="n">
            <input 
              :id="'star' + n" 
              type="radio" 
              name="rating" 
              :value="n"
              v-model="rating"
            >
            <label 
              :for="'star' + n" 
              class="fas fa-star"
              :class="{ 'text-yellow-400': rating >= n }"
            ></label>
          </template>
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm text-gray-600 mb-2">您的评价或建议：</label>
        <textarea 
          v-model="comment"
          rows="3" 
          class="w-full border border-gray-300 rounded-lg p-3 text-sm" 
          placeholder="分享您对这套穿搭的看法..."
        ></textarea>
      </div>
      
      <div class="bg-blue-50 rounded-lg p-3 mb-4">
        <p class="text-xs text-blue-600 flex items-start">
          <i class="fas fa-info-circle mr-2 mt-0.5"></i>
          保存后将不能再修改此推荐方案。您可以在"推荐记录"中查看所有已保存的方案。
        </p>
      </div>
      
      <div class="flex space-x-3">
        <button 
          class="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600"
          @click="close"
        >
          取消
        </button>
        <button 
          class="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600"
          @click="saveForLater"
        >
          稍后评价
        </button>
        <button 
          class="flex-1 py-2 bg-blue-500 text-white rounded-lg"
          @click="save"
          :disabled="!rating"
        >
          保存并完成
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SaveModal',
  
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  
  emits: ['update:show', 'save', 'later'],
  
  setup(props, { emit }) {
    const rating = ref(0)
    const comment = ref('')
    
    const close = () => {
      rating.value = 0
      comment.value = ''
      emit('update:show', false)
    }
    
    const save = () => {
      emit('save', rating.value, comment.value)
      close()
    }
    
    const saveForLater = () => {
      emit('later')
      close()
    }
    
    return {
      rating,
      comment,
      close,
      save,
      saveForLater
    }
  }
}
</script>

<style scoped>
.rating {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
}

.rating input {
  display: none;
}

.rating label {
  color: #ddd;
  font-size: 28px;
  padding: 0 2px;
  cursor: pointer;
}

.rating label:hover,
.rating label:hover ~ label,
.rating input:checked ~ label {
  color: #FFD700;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 