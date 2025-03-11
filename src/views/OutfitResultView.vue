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
import { useRoute } from 'vue-router'
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
    const route = useRoute()
    
    // 获取路由参数
    const scene = route.query.scene || ''
    const tags = (route.query.tags || '').split(',').filter(Boolean)
    const gender = route.query.gender || ''
    const recommendData = route.state || {}
    
    // 状态管理
    const currentVersion = ref(1)
    const aiPrompt = ref('')
    const outfitPlan = ref({
      top: '',
      bottom: '',
      accessories: '',
      keyPoints: []
    })
    
    // 根据场景和标签生成穿搭方案
    const generateOutfitPlan = () => {
      let plan = {
        top: '',
        bottom: '',
        accessories: '',
        keyPoints: []
      }
      
      // 根据场景生成基础方案
      switch(scene) {
        case '商务正式':
          if(gender === 'female') {
            plan = {
              top: '米色修身西装外套，搭配白色丝质衬衫，展现干练专业的形象。',
              bottom: '深灰色直筒西装裤，裤长恰到好处，突出腿部线条。',
              accessories: '黑色尖头细跟高跟鞋，搭配简约银色项链和手表。',
              keyPoints: [
                '整体配色以中性色调为主，突出职业感',
                '版型修身但不紧绷，保持舒适度',
                '配饰简约大方，提升整体质感'
              ]
            }
          } else {
            plan = {
              top: '深蓝色商务西装外套，搭配浅蓝色衬衫，展现稳重专业的形象。',
              bottom: '深灰色修身西装裤，长度适中，突出挺拔身姿。',
              accessories: '黑色商务皮鞋，搭配深色皮带和简约手表。',
              keyPoints: [
                '整体配色沉稳大气，突出商务感',
                '版型合体有型，保持舒适度',
                '配饰经典耐看，提升整体质感'
              ]
            }
          }
          break
        case '休闲日常':
          if(gender === 'female') {
            plan = {
              top: '米白色针织开衫，搭配浅色棉质T恤，营造舒适随性的氛围。',
              bottom: '浅色直筒牛仔裤，版型自然，突出休闲感。',
              accessories: '小白鞋，搭配简约手提包和精致项链。',
              keyPoints: [
                '整体配色清新自然，突出休闲感',
                '版型舒适宽松，适合日常活动',
                '配饰简约时尚，增添个性魅力'
              ]
            }
          } else {
            plan = {
              top: '浅灰色休闲卫衣，搭配白色T恤，打造舒适休闲的造型。',
              bottom: '深色直筒牛仔裤，版型适中，展现休闲质感。',
              accessories: '运动休闲鞋，搭配简约帆布包和运动手表。',
              keyPoints: [
                '整体配色协调自然，突出休闲感',
                '版型适中舒适，适合日常活动',
                '配饰实用时尚，彰显个性风格'
              ]
            }
          }
          break
        case '约会':
          if(gender === 'female') {
            plan = {
              top: '浅粉色针织衫，搭配白色蕾丝内搭，营造温柔浪漫的氛围。',
              bottom: '高腰A字裙，长度适中，展现优雅气质。',
              accessories: '裸色细跟凉鞋，搭配精致小包和珍珠项链。',
              keyPoints: [
                '整体配色温柔浪漫，突出约会氛围',
                '版型优雅贴身，突出女性魅力',
                '配饰精致典雅，提升整体格调'
              ]
            }
          } else {
            plan = {
              top: '浅蓝色修身衬衫，搭配深色针织背心，展现绅士气质。',
              bottom: '修身休闲裤，版型合适，突出品味。',
              accessories: '棕色皮鞋，搭配简约皮带和精致腕表。',
              keyPoints: [
                '整体配色清新得体，突出约会氛围',
                '版型修身有型，展现男士魅力',
                '配饰简约精致，提升整体格调'
              ]
            }
          }
          break
        case '运动':
          if(gender === 'female') {
            plan = {
              top: '浅色运动背心，搭配透气运动外套，打造活力造型。',
              bottom: '黑色运动紧身裤，突出运动感和线条美。',
              accessories: '专业运动鞋，搭配运动手表和发带。',
              keyPoints: [
                '整体配色清爽活力，突出运动感',
                '版型贴合舒适，适合运动需求',
                '配饰实用专业，注重运动功能'
              ]
            }
          } else {
            plan = {
              top: '速干运动T恤，搭配轻薄运动外套，展现运动活力。',
              bottom: '黑色运动长裤，版型适中，便于运动。',
              accessories: '专业运动鞋，搭配运动手表和护腕。',
              keyPoints: [
                '整体配色简洁大方，突出运动感',
                '版型适中舒适，满足运动需求',
                '配饰专业实用，注重运动功能'
              ]
            }
          }
          break
        case '派对':
          if(gender === 'female') {
            plan = {
              top: '亮片装饰上衣，搭配时尚小外套，打造派对焦点。',
              bottom: '修身小黑裙，长度适中，展现派对气氛。',
              accessories: '闪亮高跟鞋，搭配精致晚宴包和耀眼首饰。',
              keyPoints: [
                '整体配色明艳耀眼，突出派对氛围',
                '版型修身性感，展现派对魅力',
                '配饰闪亮精致，提升整体气场'
              ]
            }
          } else {
            plan = {
              top: '深色休闲西装，搭配时尚衬衫，展现派对品味。',
              bottom: '修身西装裤，版型合适，突出派对感。',
              accessories: '时尚皮鞋，搭配个性配饰和精致腕表。',
              keyPoints: [
                '整体配色沉稳时尚，突出派对氛围',
                '版型修身有型，展现派对魅力',
                '配饰个性时尚，提升整体品味'
              ]
            }
          }
          break
        default:
          if(gender === 'female') {
            plan = {
              top: '白色简约T恤，搭配浅色针织开衫，营造清新日常感。',
              bottom: '浅色直筒牛仔裤，版型自然舒适。',
              accessories: '小白鞋，搭配简约包包和基础首饰。',
              keyPoints: [
                '整体配色清新自然，适合日常穿着',
                '版型舒适大方，突出基础搭配',
                '配饰简约实用，易于日常搭配'
              ]
            }
          } else {
            plan = {
              top: '纯色圆领T恤，搭配休闲衬衫，打造基础日常感。',
              bottom: '直筒牛仔裤，版型自然舒适。',
              accessories: '休闲板鞋，搭配简约腕表。',
              keyPoints: [
                '整体配色简约大方，适合日常穿着',
                '版型舒适自然，突出基础搭配',
                '配饰简单实用，易于日常搭配'
              ]
            }
          }
      }
      
      outfitPlan.value = plan
      
      // 根据标签调整AI提示词
      let promptKeywords = []
      if(gender === 'female') {
        promptKeywords.push('young woman')
      } else {
        promptKeywords.push('young man')
      }
      
      // 添加场景关键词
      switch(scene) {
        case '商务正式':
          promptKeywords.push('professional business setting')
          break
        case '休闲日常':
          promptKeywords.push('casual daily life setting')
          break
        case '约会':
          promptKeywords.push('romantic date setting')
          break
        case '运动':
          promptKeywords.push('sports and fitness setting')
          break
        case '派对':
          promptKeywords.push('party and social gathering setting')
          break
        default:
          promptKeywords.push('casual everyday setting')
      }
      
      // 添加服装关键词
      promptKeywords.push(`wearing ${plan.top.split('，')[0].toLowerCase()}`)
      promptKeywords.push(plan.bottom.split('，')[0].toLowerCase())
      promptKeywords.push(plan.accessories.split('，')[0].toLowerCase())
      
      // 添加标签关键词
      if(tags.includes('优雅知性')) {
        promptKeywords.push('elegant and intellectual style')
      }
      if(tags.includes('活力运动')) {
        promptKeywords.push('energetic and sporty look')
      }
      if(tags.includes('甜美可爱')) {
        promptKeywords.push('sweet and cute style')
      }
      if(tags.includes('简约时尚')) {
        promptKeywords.push('minimalist fashion style')
      }
      if(tags.includes('成熟稳重')) {
        promptKeywords.push('mature and steady style')
      }
      
      // 添加图片质量和背景要求
      promptKeywords.push('high quality photo')
      promptKeywords.push('clean modern background')
      promptKeywords.push('natural lighting')
      promptKeywords.push('4k quality')
      promptKeywords.push('professional fashion photography')
      
      // 更新AI提示词
      aiPrompt.value = promptKeywords.join(', ')
    }
    
    // 初始化生成穿搭方案
    generateOutfitPlan()
    
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