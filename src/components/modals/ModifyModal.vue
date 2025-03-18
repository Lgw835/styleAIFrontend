<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 半透明黑色蒙版背景 -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('update:show', false)"></div>
      
      <!-- 模态框内容 -->
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 z-10 transform transition-all">
        <!-- 标题栏 -->
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">修改穿搭方案</h3>
          <button @click="$emit('update:show', false)" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 内容区域 -->
        <div class="px-6 py-4 space-y-4">
          <p class="text-sm text-gray-600">
            请输入您想修改的内容或偏好，AI将根据您的需求调整穿搭方案。
          </p>
          
          <textarea
            v-model="localModifyText"
            class="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            :placeholder="placeholderText"
            rows="5"
          ></textarea>
          
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-600">快速选择：</p>
            <div class="flex flex-wrap gap-2">
              <span @click="quickSelect('我想要一套更正式的搭配')" 
                    class="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                更正式风格
              </span>
              <span @click="quickSelect('我想要更休闲的风格')" 
                    class="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                更休闲风格
              </span>
              <span @click="quickSelect('希望配色更鲜艳一些')" 
                    class="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                更鲜艳配色
              </span>
              <span @click="quickSelect('想要更低调素雅的搭配')" 
                    class="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                低调素雅
              </span>
            </div>
          </div>
        </div>
        
        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="submit"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center"
            :disabled="!canSubmit || isSubmitting"
          >
            <i v-if="isSubmitting" class="fas fa-spinner animate-spin mr-2"></i>
            {{isSubmitting ? '处理中...' : '提交修改'}}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ModifyModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    modifyText: {
      type: String,
      default: ''
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      localModifyText: '',
      placeholderText: '请输入您的修改意见或偏好，例如：\n"我想要更正式的风格"\n"能否推荐更适合夏季的搭配？"'
    }
  },
  
  watch: {
    modifyText(newValue) {
      this.localModifyText = newValue
    },
    show(newValue) {
      if (newValue) {
        this.localModifyText = this.modifyText
        // 当模态框显示时，防止背景滚动
        document.body.style.overflow = 'hidden'
      } else {
        // 当模态框关闭时，恢复背景滚动
        document.body.style.overflow = ''
      }
    }
  },
  
  computed: {
    canSubmit() {
      return this.localModifyText.trim().length > 0
    }
  },
  
  methods: {
    submit() {
      if (!this.canSubmit) return
      
      this.$emit('update:modify-text', this.localModifyText)
      this.$emit('submit')
    },
    
    quickSelect(suggestion) {
      this.localModifyText = suggestion
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

/* 给模态框添加动画效果 */
.transform {
  transition-property: transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* 防止背景滚动时的跳动 */
.fixed {
  position: fixed;
}
</style> 