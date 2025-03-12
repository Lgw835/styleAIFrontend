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
            <div v-if="isLoading" class="flex flex-col items-center justify-center h-full">
              <div class="loading-spinner mb-4"></div>
              <p class="text-gray-500">正在生成试衣效果，请稍候...</p>
            </div>
            <div v-else-if="fittingResult" class="h-full">
              <img 
                :src="fittingResult" 
                class="w-full h-full object-cover" 
                alt="试衣效果"
              >
            </div>
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-gray-500">选择人物和衣物后查看试衣效果</p>
            </div>
          </div>
        </div>
        
        <button 
          @click="startFitting"
          class="btn-primary w-full mt-4"
          :disabled="!canStartFitting || isLoading"
        >
          <template v-if="isLoading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            试衣中...
          </template>
          <template v-else>
            开始试衣
          </template>
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

      <!-- 错误消息 -->
      <div v-if="errorMessage" class="error-message my-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg">
        <i class="fas fa-exclamation-circle mr-2"></i>
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { Toast } from 'vant'  // 修正为正确的导入方式

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
const isLoading = ref(false)
const errorMessage = ref('')

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
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: 替换为实际的API调用
    // const response = await fetch('你的试衣API地址', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     personImage: personImage.value,
    //     clothImage: clothImage.value,
    //     fittingType: selectedFittingType.value
    //   })
    // })
    
    // if (!response.ok) {
    //   throw new Error('服务器响应错误')
    // }
    
    // const data = await response.json()
    // fittingResult.value = data.resultImage
    
    // 模拟结果
    fittingResult.value = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop'
    isFittingDone.value = true
  } catch (error) {
    console.error('试衣过程中出错:', error)
    errorMessage.value = error.message || '试衣失败，请稍后重试'
    Toast.fail(errorMessage.value) // 使用正确的 Vant Toast API
  } finally {
    isLoading.value = false
  }
}

// 更新重新生成功能
const regenerate = async () => {
  try {
    // 显示加载状态
    isLoading.value = true
    errorMessage.value = ''
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: 替换为实际的API调用
    // 与startFitting类似，但保持当前的人物和衣物图片不变
    // const response = await fetch('你的试衣API地址', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     personImage: personImage.value,
    //     clothImage: clothImage.value,
    //     fittingType: selectedFittingType.value,
    //     regenerate: true  // 可以添加标记表示这是重新生成请求
    //   })
    // })
    
    // if (!response.ok) {
    //   throw new Error('服务器响应错误')
    // }
    
    // const data = await response.json()
    // fittingResult.value = data.resultImage
    
    // 模拟生成不同结果
    const randomId = Math.floor(Math.random() * 1000)
    fittingResult.value = `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&r=${randomId}`
    
    // 显示成功提示
    Toast.success('已重新生成效果')
  } catch (error) {
    console.error('重新生成过程中出错:', error)
    errorMessage.value = error.message || '重新生成失败，请稍后重试'
    Toast.fail(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

const resetFitting = () => {
  isFittingDone.value = false
  personImage.value = null
  clothImage.value = null
}

const saveImage = () => {
  // TODO: 实现图片保存逻辑
}

// 添加从衣柜选择衣物的函数
const selectFromWardrobe = (cloth) => {
  // 将选中的衣物图片设置为当前衣物
  clothImage.value = cloth.image
  
  // 根据衣物类型自动选择对应的试衣类别
  if (cloth.type === 'top') {
    selectedFittingType.value = 'upper'
  } else if (cloth.type === 'bottom') {
    selectedFittingType.value = 'lower'
  } else if (cloth.type === 'full') {
    selectedFittingType.value = 'full'
  }
  
  // 可选：切换回上传标签页以便用户查看选中的衣物
  activeTab.value = 'upload'
  
  // 显示成功提示
  Toast.success('已选择：' + cloth.name)
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

/* 加载动画样式 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(64, 150, 255, 0.2);
  border-radius: 50%;
  border-top-color: #4096FF;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误消息样式 */
.error-message {
  font-size: 14px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 