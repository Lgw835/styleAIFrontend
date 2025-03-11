<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-xl w-11/12 max-w-lg p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">编辑AI提示词</h3>
        <button class="text-gray-500" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="mb-4">
        <textarea 
          v-model="localPrompt"
          rows="5" 
          class="w-full border border-gray-300 rounded-lg p-3 text-sm" 
          placeholder="输入AI生成图像的提示词..."
        ></textarea>
      </div>
      
      <p class="text-xs text-gray-500 mb-4">提示：详细描述服装类型、颜色、风格、场景等，可以获得更好的效果。</p>
      
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
          :disabled="!localPrompt.trim()"
        >
          应用并重新生成
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'PromptModal',
  
  props: {
    show: {
      type: Boolean,
      required: true
    },
    prompt: {
      type: String,
      required: true
    }
  },
  
  emits: ['update:show', 'update:prompt'],
  
  setup(props, { emit }) {
    const localPrompt = ref(props.prompt)
    
    watch(() => props.prompt, (newPrompt) => {
      localPrompt.value = newPrompt
    })
    
    const close = () => {
      localPrompt.value = props.prompt
      emit('update:show', false)
    }
    
    const save = () => {
      emit('update:prompt', localPrompt.value.trim())
      emit('update:show', false)
    }
    
    return {
      localPrompt,
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