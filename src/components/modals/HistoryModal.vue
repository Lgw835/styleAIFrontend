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
          class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
          :class="{ 'bg-gray-50 border-blue-500': selectedVersion === version.version }"
          @click="selectVersion(version.version)"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">
              版本 {{ version.version }}
              <span v-if="version.version === currentVersion" class="text-gray-500 text-sm">（当前）</span>
            </span>
            <span class="text-xs text-gray-500">{{ version.timestamp }}</span>
          </div>
          <p class="text-sm text-gray-600">{{ version.description }}</p>
        </div>
        
        <!-- 查看更多按钮 -->
        <button 
          v-if="hasMoreVersions"
          class="w-full py-2 text-blue-500 text-sm text-center hover:bg-gray-100 rounded-lg"
          @click="showFullHistory"
        >
          查看更多历史版本 ({{ remainingVersions }} 个)
        </button>
      </div>
      
      <div class="mt-4 pt-4 border-t">
        <button 
          class="w-full py-2 bg-blue-500 text-white rounded-lg"
          :disabled="!selectedVersion || selectedVersion === currentVersion"
          @click="restore"
        >
          恢复选中版本
        </button>
      </div>
    </div>

    <!-- 完整历史版本模态框 -->
    <div v-if="showFullModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-xl w-11/12 max-w-lg max-h-[80vh] flex flex-col">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-medium">全部历史版本</h3>
          <button class="text-gray-500" @click="closeFullHistory">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div 
            v-for="version in versions" 
            :key="version.version"
            class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-gray-50 border-blue-500': selectedVersion === version.version }"
            @click="selectVersion(version.version)"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">
                版本 {{ version.version }}
                <span v-if="version.version === currentVersion" class="text-gray-500 text-sm">（当前）</span>
              </span>
              <span class="text-xs text-gray-500">{{ version.timestamp }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ version.description }}</p>
          </div>
        </div>
        
        <div class="p-4 border-t">
          <button class="w-full py-2 bg-blue-500 text-white rounded-lg" @click="closeFullHistory">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

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
      required: true
    }
  },
  
  emits: ['update:show', 'restore'],
  
  setup(props, { emit }) {
    const selectedVersion = ref(null)
    const showFullModal = ref(false)
    const MAX_VERSIONS = 10
    
    // 计算要显示的版本
    const displayVersions = computed(() => {
      return props.versions.slice(0, MAX_VERSIONS)
    })
    
    // 是否有更多版本
    const hasMoreVersions = computed(() => {
      return props.versions.length > MAX_VERSIONS
    })
    
    // 剩余版本数量
    const remainingVersions = computed(() => {
      return props.versions.length - MAX_VERSIONS
    })
    
    const selectVersion = (version) => {
      selectedVersion.value = version
    }
    
    const close = () => {
      selectedVersion.value = null
      emit('update:show', false)
    }
    
    const restore = () => {
      const version = props.versions.find(v => v.version === selectedVersion.value)
      if (version) {
        emit('restore', version)
      }
    }
    
    const showFullHistory = () => {
      showFullModal.value = true
    }
    
    const closeFullHistory = () => {
      showFullModal.value = false
    }
    
    return {
      selectedVersion,
      showFullModal,
      displayVersions,
      hasMoreVersions,
      remainingVersions,
      selectVersion,
      close,
      restore,
      showFullHistory,
      closeFullHistory
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