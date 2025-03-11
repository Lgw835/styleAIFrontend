<template>
  <div class="virtual-fitting min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="虚拟试衣" 
      :back-link="'/wardrobe'"
    />

    <!-- 主要内容区 -->
    <div class="pt-14 px-4">
      <!-- 虚拟模型展示区 -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <div class="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-user text-6xl text-gray-400"></i>
        </div>
      </div>

      <!-- 操作区 -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <h3 class="text-lg font-medium mb-4">选择衣物</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(item, index) in selectedClothes" 
               :key="index"
               class="bg-gray-50 rounded-lg p-3">
            <div class="text-sm text-gray-500 mb-2">{{ item.type }}</div>
            <div class="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover rounded-lg">
              <i v-else class="fas fa-plus text-gray-400"></i>
            </div>
            <button @click="selectClothing(item.type)" 
                    class="w-full py-2 text-sm text-blue-500 border border-blue-500 rounded-lg">
              {{ item.image ? '更换' : '选择' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 试衣效果 -->
      <div class="bg-white rounded-lg p-4 mb-4">
        <h3 class="text-lg font-medium mb-4">搭配效果</h3>
        <div class="space-y-2 text-sm text-gray-600">
          <p>• AI分析：整体搭配和谐，色彩搭配得当</p>
          <p>• 建议：可以添加一些配饰来提升整体效果</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

// 已选择的衣物
const selectedClothes = ref([
  { type: '上装', image: '', name: '' },
  { type: '下装', image: '', name: '' },
  { type: '鞋子', image: '', name: '' },
  { type: '配饰', image: '', name: '' }
])

// 选择衣物
const selectClothing = (type) => {
  // TODO: 实现衣物选择逻辑
  console.log('选择衣物类型:', type)
}
</script>

<style scoped>
.virtual-fitting {
  min-height: 100vh;
}
</style> 