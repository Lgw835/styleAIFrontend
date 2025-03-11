<template>
  <div class="clothing-detail min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="衣物详情" 
      :back-link="'/wardrobe'"
    />

    <!-- 主要内容区 -->
    <div class="pt-14 pb-24">
      <!-- 图片展示 -->
      <div class="bg-white">
        <div class="relative pb-[100%]">
          <img :src="clothing.image" 
               :alt="clothing.name"
               class="absolute inset-0 w-full h-full object-cover">
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="bg-white mt-2 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-medium">{{ clothing.name }}</h2>
          <span class="px-2 py-1 bg-blue-50 text-blue-500 rounded text-sm">{{ clothing.style }}</span>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="bg-white mt-2 p-4">
        <h3 class="text-lg font-medium mb-4">详细信息</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-500">衣物类型</span>
            <span class="text-gray-900">{{ clothing.type }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">衣物类别</span>
            <span class="text-gray-900">{{ clothing.category }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">颜色</span>
            <div class="flex items-center">
              <span class="w-4 h-4 rounded-full border mr-2"
                    :class="clothing.color === '白色' ? 'bg-white border-gray-200' : ''"
                    :style="{ backgroundColor: clothing.color === '深蓝色' ? '#1e40af' : clothing.color }">
              </span>
              <span class="text-gray-900">{{ clothing.color }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">适用季节</span>
            <span class="text-gray-900">{{ clothing.season }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-500">风格</span>
            <span class="text-gray-900">{{ clothing.style }}</span>
          </div>
        </div>
      </div>

      <!-- 描述信息 -->
      <div class="bg-white mt-2 p-4">
        <h3 class="text-lg font-medium mb-2">描述</h3>
        <p class="text-gray-600 text-sm leading-relaxed">
          {{ clothing.description }}
        </p>
      </div>

      <!-- 搭配建议 -->
      <div class="bg-white mt-2 p-4">
        <h3 class="text-lg font-medium mb-2">搭配建议</h3>
        <div class="space-y-2 text-sm text-gray-600">
          <p v-for="(suggestion, index) in clothing.matchingSuggestions" 
             :key="index">• {{ suggestion }}</p>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div class="flex space-x-4">
        <button @click="handleEdit" 
                class="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium">
          编辑信息
        </button>
        <button @click="handleDelete" 
                class="flex-1 border border-red-500 text-red-500 py-3 rounded-lg font-medium">
          删除衣物
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const route = useRoute()
const router = useRouter()

// 模拟的衣物数据
const clothing = ref({
  id: 1,
  name: '白色棉质衬衫',
  style: '商务风格',
  type: '上半身',
  category: '衬衫',
  color: '白色',
  season: '春秋',
  image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  description: '这是一件经典的白色商务衬衫，采用100%优质棉质面料，手感柔软，透气性好。衣身采用修身剪裁，既不会太过宽松，也不会太过紧身，穿着舒适。领型为经典尖领设计，适合搭配各种领带。袖口采用双层设计，可根据需要调整长度。这件衬衫非常适合商务场合穿着，可以搭配西装、西裤，打造正式的商务造型。同时也可以单穿或搭配休闲裤，适合日常通勤或者商务休闲场合。',
  matchingSuggestions: [
    '正装搭配：搭配深色西装、西裤和皮鞋，适合正式场合',
    '商务休闲：搭配卡其色休闲裤、棕色皮鞋，适合日常办公',
    '休闲风格：搭配牛仔裤、白色运动鞋，适合周末休闲'
  ]
})

// 编辑衣物信息
const handleEdit = () => {
  router.push(`/wardrobe/edit/${clothing.value.id}`)
}

// 删除衣物
const handleDelete = () => {
  if (confirm('确定要删除这件衣物吗？')) {
    // TODO: 实现删除逻辑
    router.push('/wardrobe')
  }
}

onMounted(() => {
  // TODO: 根据路由参数获取衣物详情
  const clothingId = route.params.id
  // fetchClothingDetail(clothingId)
})
</script>

<style scoped>
.clothing-detail {
  min-height: 100vh;
}
</style> 