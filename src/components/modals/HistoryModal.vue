<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-xl w-11/12 max-w-lg p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">历史版本</h3>
          <button class="text-gray-500" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div 
            v-for="version in displayVersions" 
            :key="version.version"
            class="border rounded-lg p-3 mb-3 last:mb-0"
            :class="{ 'border-blue-500 bg-blue-50': version.version === currentVersion }"
          >
            <div class="flex justify-between mb-2">
              <div class="font-medium">
                版本 {{ version.version }} 
                <span v-if="version.version === currentVersion" class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded ml-2">
                  当前版本
                </span>
              </div>
              <div class="text-gray-500 text-sm">{{ version.timestamp }}</div>
            </div>
            
            <div class="text-gray-700 mb-2">{{ version.description }}</div>
            
            <button 
              v-if="version.version !== currentVersion"
              @click="$emit('restore', version)" 
              class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-2 transition-colors">
              切换到此版本
            </button>
          </div>
        </div>
        
        <slot name="confirm-message"></slot>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue'
  
  export default {
    name: 'HistoryModal',
    
    props: {
      show: {
        type: Boolean,
        required: true
      },
      versions: {
        type: Array,
        required: true
      },
      currentVersion: {
        type: Number,
        default: 1
      }
    },
    
    emits: ['update:show', 'restore'],
    
    setup(props, { emit }) {
      // 计算显示的版本列表
      const displayVersions = computed(() => {
        return [...props.versions].sort((a, b) => b.version - a.version)
      })
      
      const close = () => {
        emit('update:show', false)
      }
      
      return {
        displayVersions,
        close
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