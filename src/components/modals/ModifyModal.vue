<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-xl w-11/12 max-w-lg p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">修改穿搭方案</h3>
        <button class="text-gray-500" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="mb-4">
        <textarea 
          v-model="description"
          rows="8" 
          class="w-full border border-gray-300 rounded-lg p-3 text-sm" 
          placeholder="请详细描述您想要的修改，例如：&#10;1. 我想要更正式的风格&#10;2. 颜色改成深色系的搭配&#10;3. 增加一些亮色点缀"
        ></textarea>
      </div>
      
      <div class="flex space-x-3">
        <button 
          class="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600"
          @click="close"
        >
          取消
        </button>
        <button 
          class="flex-1 py-2 bg-blue-500 text-white rounded-lg"
          @click="save"
          :disabled="!description.trim()"
        >
          确认修改
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ModifyModal',
  
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  
  emits: ['update:show', 'modify'],
  
  setup(props, { emit }) {
    const description = ref('')
    
    const close = () => {
      description.value = ''
      emit('update:show', false)
    }
    
    const save = () => {
      emit('modify', description.value.trim())
      close()
    }
    
    return {
      description,
      close,
      save
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 