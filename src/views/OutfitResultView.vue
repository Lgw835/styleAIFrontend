<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="穿搭推荐" 
      :backLink="'/'"
      class="bg-white border-b"
    >
      <template #right-action>
        <button class="text-gray-500 hover:text-blue-500" @click="openHistoryModal">
          <i class="fas fa-history"></i>
        </button>
      </template>
    </SubPageNavBar>

    <!-- 主要内容区 -->
    <div class="flex-1 pt-12 pb-4">
      <div class="p-4 space-y-4">
        <!-- 步骤指示器 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">版本 {{ currentVersion }}</span>
          </div>
        </div>

        <!-- 穿搭方案 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-3">穿搭方案</h3>
          <div class="prose text-gray-600 text-sm leading-relaxed">
            <h4 class="font-medium text-black mb-2">上装</h4>
            <p class="mb-4">{{ outfitPlan.top }}</p>
            
            <h4 class="font-medium text-black mb-2">下装</h4>
            <p class="mb-4">{{ outfitPlan.bottom }}</p>
            
            <h4 class="font-medium text-black mb-2">鞋子配饰</h4>
            <p class="mb-4">{{ outfitPlan.accessories }}</p>
            
            <h4 class="font-medium text-black mb-2">搭配要点</h4>
            <p v-for="(point, index) in outfitPlan.keyPoints" :key="index">
              - {{ point }}
            </p>
          </div>
        </div>

        <!-- AI提示词 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium">AI提示词</h3>
            <button class="text-sm text-blue-500" @click="openPromptModal">编辑</button>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p>{{ aiPrompt }}</p>
          </div>
        </div>

        <!-- 穿搭效果图 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium">穿搭效果图</h3>
            <div class="flex space-x-2" v-if="outfitImage">
              <button class="text-gray-600 hover:text-blue-500" @click="regenerateImage">
                <i class="fas fa-redo"></i>
                <span class="text-sm ml-1">重新生成</span>
              </button>
              <button class="text-gray-600 hover:text-blue-500" @click="downloadImage">
                <i class="fas fa-download"></i>
                <span class="text-sm ml-1">保存图片</span>
              </button>
            </div>
          </div>
          
          <!-- 生成按钮 -->
          <button v-if="!isGenerating && !outfitImage" 
                  @click="generateImage"
                  class="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors">
            <i class="fas fa-magic text-xl mr-2"></i>
            <span>点击生成穿搭效果图</span>
          </button>

          <!-- 生成进度 -->
          <div v-if="isGenerating" class="space-y-4">
            <div class="flex items-center justify-center space-x-3">
              <div class="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
              <span class="text-blue-500">{{ generatingStatus }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full transition-all duration-300"
                   :style="{ width: `${generatingProgress}%` }"></div>
            </div>
          </div>

          <!-- 图片展示 -->
          <div v-if="outfitImage" class="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
            <img :src="outfitImage" alt="穿搭效果图" class="w-full h-auto object-cover">
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-4">
          <button class="flex-1 bg-white border border-blue-500 text-blue-500 py-3 rounded-lg"
                  @click="openModifyModal">
            修改方案
          </button>
          <button class="flex-1 bg-blue-500 text-white py-3 rounded-lg"
                  :class="{ 'opacity-50 cursor-not-allowed': !canSave }"
                  :disabled="!canSave"
                  @click="openSaveModal">
            保存方案
          </button>
        </div>
      </div>
    </div>

    <!-- 各种模态框组件 -->
    <PromptModal 
      v-model:show="showPromptModal"
      :prompt="aiPrompt"
      @update:prompt="updatePrompt"
    />
    
    <SaveModal 
      v-model:show="showSaveModal"
      @save="saveOutfit"
      @later="saveForLater"
    />
    
    <ModifyModal 
      v-model:show="showModifyModal"
      @modify="modifyOutfit"
    />
    
    <HistoryModal 
      v-model:show="showHistoryModal"
      :versions="versionHistory"
      @restore="restoreVersion"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import PromptModal from '@/components/modals/PromptModal.vue'
import SaveModal from '@/components/modals/SaveModal.vue'
import ModifyModal from '@/components/modals/ModifyModal.vue'
import HistoryModal from '@/components/modals/HistoryModal.vue'

export default {
  name: 'OutfitResultView',
  
  components: {
    SubPageNavBar,
    PromptModal,
    SaveModal,
    ModifyModal,
    HistoryModal
  },

  setup() {
    // 状态管理
    const currentVersion = ref(3)
    const outfitPlan = ref({
      top: '米色修身西装外套，搭配白色丝质衬衫，展现干练专业的形象。',
      bottom: '深灰色直筒西装裤，裤长恰到好处，突出腿部线条。',
      accessories: '黑色尖头细跟高跟鞋，搭配简约银色项链和手表。',
      keyPoints: [
        '整体配色以中性色调为主，突出职业感',
        '版型修身但不紧绷，保持舒适度',
        '配饰简约大方，提升整体质感'
      ]
    })
    
    const aiPrompt = ref('professional business woman, wearing beige fitted blazer, white silk shirt, gray straight-leg pants, black pointed high heels, minimal silver accessories, clean and modern office background, natural lighting, 4k quality')
    
    // 图片生成相关
    const isGenerating = ref(false)
    const generatingProgress = ref(0)
    const generatingStatus = ref('正在生成中...')
    const outfitImage = ref(null)
    
    // 模态框控制
    const showPromptModal = ref(false)
    const showSaveModal = ref(false)
    const showModifyModal = ref(false)
    const showHistoryModal = ref(false)
    
    // 版本历史
    const versionHistory = ref([
      {
        version: 1,
        timestamp: '2024-03-15 15:10',
        description: '初始方案',
        outfit: outfitPlan.value,
        prompt: aiPrompt.value
      }
    ])

    // 计算属性
    const canSave = computed(() => outfitImage.value !== null)

    // 方法
    const generateImage = async () => {
      isGenerating.value = true
      generatingProgress.value = 0
      
      // 模拟生成过程
      const interval = setInterval(() => {
        if (generatingProgress.value < 100) {
          generatingProgress.value += 10
        }
      }, 200)

      setTimeout(() => {
        clearInterval(interval)
        isGenerating.value = false
        outfitImage.value = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      }, 2000)
    }

    const regenerateImage = () => {
      outfitImage.value = null
      generateImage()
    }

    const downloadImage = () => {
      // 实现图片下载逻辑
      console.log('下载图片')
    }

    const openPromptModal = () => {
      showPromptModal.value = true
    }

    const updatePrompt = (newPrompt) => {
      aiPrompt.value = newPrompt
      regenerateImage()
    }

    const openSaveModal = () => {
      showSaveModal.value = true
    }

    const saveOutfit = (rating, comment) => {
      console.log('保存方案', { rating, comment })
      showSaveModal.value = false
    }

    const saveForLater = () => {
      console.log('稍后保存')
      showSaveModal.value = false
    }

    const openModifyModal = () => {
      showModifyModal.value = true
    }

    const modifyOutfit = (description) => {
      // 更新版本
      currentVersion.value++
      
      // 更新方案
      // 这里应该根据描述调用后端API来更新方案
      console.log('修改方案', description)
      
      showModifyModal.value = false
      regenerateImage()
    }

    const openHistoryModal = () => {
      showHistoryModal.value = true
    }

    const restoreVersion = (version) => {
      currentVersion.value = version.version
      outfitPlan.value = version.outfit
      aiPrompt.value = version.prompt
      regenerateImage()
      showHistoryModal.value = false
    }

    return {
      currentVersion,
      outfitPlan,
      aiPrompt,
      isGenerating,
      generatingProgress,
      generatingStatus,
      outfitImage,
      canSave,
      showPromptModal,
      showSaveModal,
      showModifyModal,
      showHistoryModal,
      versionHistory,
      generateImage,
      regenerateImage,
      downloadImage,
      openPromptModal,
      updatePrompt,
      openSaveModal,
      saveOutfit,
      saveForLater,
      openModifyModal,
      modifyOutfit,
      openHistoryModal,
      restoreVersion
    }
  }
}
</script>

<style scoped>
.prose {
  max-width: none;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 