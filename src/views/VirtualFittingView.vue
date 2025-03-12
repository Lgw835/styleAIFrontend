<template>
  <div class="virtual-fitting min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="虚拟试衣"
      :back-link="{ path: '/wardrobe' }"
      class="fixed top-0 w-full z-10"
    >
      <template #right-action>
        <router-link to="/fitting-history" class="p-2 text-gray-600">
          <i class="fas fa-history text-lg"></i>
        </router-link>
      </template>
    </SubPageNavBar>

    <!-- 主要内容区 -->
    <div class="flex-1 pt-16 pb-6 px-4 space-y-4">
      <!-- 人物照片上传 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <h3 class="text-base font-medium mb-3">上传人物照片</h3>
        <div class="upload-container">
          <input 
            type="file" 
            accept="image/*" 
            class="hidden" 
            id="person-image"
            @change="handlePersonUpload"
          >
          <label for="person-image" class="block w-full h-full cursor-pointer">
            <template v-if="personImage">
              <img :src="personImage" class="w-full h-64 object-cover rounded-lg" alt="人物照片">
            </template>
            <template v-else>
              <i class="fas fa-user text-3xl text-gray-400 mb-2"></i>
              <p class="text-sm text-gray-500">点击上传全身照</p>
              <p class="text-xs text-gray-400 mt-1">建议正面站立拍摄</p>
            </template>
          </label>
        </div>
      </div>

      <!-- 衣物选择 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <h3 class="text-base font-medium mb-3">选择衣物</h3>
        
        <!-- 选择方式标签页 -->
        <div class="flex border-b mb-4">
          <button 
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-button', { 'active': activeTab === tab.id }]"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- 上传新衣物 -->
        <div v-show="activeTab === 'upload'" class="tab-content">
          <div class="upload-container">
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              id="cloth-image"
              @change="handleClothUpload"
            >
            <label for="cloth-image" class="block w-full h-full cursor-pointer">
              <template v-if="clothImage">
                <img :src="clothImage" class="w-full h-48 object-cover rounded-lg" alt="衣物照片">
              </template>
              <template v-else>
                <i class="fas fa-tshirt text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm text-gray-500">点击上传衣物照</p>
                <p class="text-xs text-gray-400 mt-1">建议平铺拍摄，背景简单</p>
              </template>
            </label>
          </div>
        </div>
        
        <!-- 从衣柜选择 -->
        <div v-show="activeTab === 'wardrobe'" class="tab-content">
          <div class="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            <div 
              v-for="(cloth, index) in wardrobeClothes" 
              :key="index"
              class="rounded-lg border-2 border-transparent cursor-pointer hover:border-blue-500"
              @click="selectFromWardrobe(cloth)"
            >
              <img :src="cloth.image" :alt="cloth.name" class="w-full aspect-square object-cover rounded-lg">
            </div>
          </div>
        </div>
      </div>
      
      <!-- 试衣类别选择 -->
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <h3 class="text-base font-medium mb-3">选择试衣类别</h3>
        <div>
          <label 
            v-for="type in fittingTypes"
            :key="type.value"
            :class="['radio-item', { 'active': selectedFittingType === type.value }]"
          >
            <input 
              type="radio" 
              v-model="selectedFittingType"
              :value="type.value"
            >
            <span>{{ type.label }}</span>
          </label>
        </div>
      </div>

      <!-- 试衣前状态 -->
      <div class="fitting-state" :class="{ 'active': !isFittingDone }">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">试衣效果</h3>
          </div>
          <div class="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <div class="flex items-center justify-center h-full">
              <p class="text-gray-500">选择人物和衣物后查看试衣效果</p>
            </div>
          </div>
        </div>
        
        <button 
          @click="startFitting"
          class="btn-primary w-full mt-4"
          :disabled="!canStartFitting"
        >
          开始试衣
        </button>
      </div>

      <!-- 试衣后状态 -->
      <div class="fitting-state" :class="{ 'active': isFittingDone }">
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">试衣效果</h3>
            <button class="text-sm text-blue-500" @click="regenerate">重新生成</button>
          </div>
          <div class="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <img 
              v-if="fittingResult" 
              :src="fittingResult" 
              class="w-full h-full object-cover" 
              alt="试衣效果"
            >
          </div>
        </div>
        
        <div class="flex space-x-4 mt-4">
          <button @click="resetFitting" class="btn-outline flex-1">
            重新试衣
          </button>
          <button @click="saveImage" class="btn-primary flex-1">
            保存图片
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

// 标签页配置
const tabs = [
  { id: 'upload', label: '上传新衣物' },
  { id: 'wardrobe', label: '从衣柜选择' }
]
const activeTab = ref('upload')

// 试衣类型选项
const fittingTypes = [
  { value: 'upper', label: '上半身' },
  { value: 'lower', label: '下半身' },
  { value: 'full', label: '全身' }
]
const selectedFittingType = ref('upper')

// 图片数据
const personImage = ref(null)
const clothImage = ref(null)
const fittingResult = ref(null)
const isFittingDone = ref(false)

// 衣柜示例数据
const wardrobeClothes = ref([
  { 
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    name: '白色衬衫',
    type: 'top'
  },
  { 
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    name: '黑色西装',
    type: 'top'
  },
  { 
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    name: '牛仔裤',
    type: 'bottom'
  },
  { 
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    name: '运动鞋',
    type: 'shoes'
  },
  // 更多示例数据...
])

// 计算是否可以开始试衣
const canStartFitting = computed(() => {
  return personImage.value && clothImage.value
})

// 处理图片上传
const handlePersonUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      personImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleClothUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      clothImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 试衣功能
const startFitting = async () => {
  // TODO: 调用试衣API
  isFittingDone.value = true
  fittingResult.value = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'
}

const regenerate = () => {
  // TODO: 重新生成逻辑
}

const resetFitting = () => {
  isFittingDone.value = false
  personImage.value = null
  clothImage.value = null
}

const saveImage = () => {
  // TODO: 实现图片保存逻辑
}
</script>

<style scoped>
.radio-item {
  @apply flex items-center p-3 border rounded-lg mb-2 cursor-pointer;
  border-color: #DDDDDD;
}

.radio-item.active {
  @apply border-blue-500;
  background-color: rgba(64, 150, 255, 0.05);
}

.tab-button {
  @apply flex-1 text-center py-3 text-sm;
  color: #666666;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  @apply text-blue-500 font-medium;
  border-bottom-color: #4096FF;
}

.upload-container {
  @apply border-2 border-dashed rounded-xl p-5 text-center bg-gray-50 cursor-pointer;
  border-color: #DDDDDD;
}

.btn-primary {
  @apply bg-blue-500 text-white py-3 rounded-lg font-medium text-center;
}

.btn-outline {
  @apply border border-blue-500 text-blue-500 py-3 rounded-lg font-medium text-center;
}

.fitting-state {
  @apply hidden;
}

.fitting-state.active {
  @apply block;
}

/* 调整顶部间距 */
.pt-16 {
  padding-top: 4rem;
}
</style> 