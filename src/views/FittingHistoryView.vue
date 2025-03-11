<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="试衣记录" 
      :back-link="'/wardrobe'"
    />

    <!-- 主要内容区 -->
    <div class="flex-1 pt-14 pb-6 px-4">
      <div class="space-y-4">
        <!-- 日期分组标题 -->
        <template v-for="(group, date) in groupedRecords" :key="date">
          <div class="flex items-center py-2">
            <div class="h-[1px] flex-1 bg-gray-200"></div>
            <span class="text-sm text-gray-500 px-4">{{ date }}</span>
            <div class="h-[1px] flex-1 bg-gray-200"></div>
          </div>
          
          <!-- 记录列表 -->
          <div v-for="record in group" 
               :key="record.id" 
               class="record-item"
               @click="showDetail(record)">
            <div class="p-3">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <div class="text-base font-medium">{{ record.title }}</div>
                  <div class="text-xs text-gray-500">{{ record.time }}</div>
                </div>
                <span :class="getTypeClass(record.type)" class="text-xs px-2 py-0.5 rounded">
                  {{ record.type }}
                </span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-1">
              <img :src="record.resultImage" 
                   class="w-full h-40 object-cover" 
                   alt="试衣效果">
              <img :src="record.clothImage" 
                   class="w-full h-40 object-cover" 
                   alt="原始衣物">
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 试衣记录详情模态框 -->
    <div class="modal" :class="{ 'active': showModal }" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header flex justify-between items-center p-4">
          <h3 class="text-lg font-medium">试衣详情</h3>
          <button @click="closeModal" class="text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body px-4 py-2" v-if="selectedRecord">
          <!-- 基本信息 -->
          <div class="mb-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-lg font-medium">{{ selectedRecord.title }}</h4>
                <p class="text-sm text-gray-500">{{ selectedRecord.time }}</p>
              </div>
              <span :class="getTypeClass(selectedRecord.type)" class="text-xs px-2 py-0.5 rounded">
                {{ selectedRecord.type }}
              </span>
            </div>
          </div>
          
          <!-- 试衣效果图 -->
          <div class="mb-4">
            <p class="text-sm font-medium mb-2">试衣效果</p>
            <div class="rounded-lg overflow-hidden">
              <img :src="selectedRecord.resultImage" 
                   class="w-full object-cover" 
                   alt="试衣效果">
            </div>
          </div>
          
          <!-- 原始图片 -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm font-medium mb-2">人物照片</p>
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img :src="selectedRecord.personImage" 
                     class="w-full h-full object-cover" 
                     alt="人物照片">
              </div>
            </div>
            <div>
              <p class="text-sm font-medium mb-2">衣物照片</p>
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img :src="selectedRecord.clothImage" 
                     class="w-full h-full object-cover" 
                     alt="衣物照片">
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-3 mb-4">
            <button @click="deleteRecord" 
                    class="flex-1 border border-red-500 text-red-500 py-2.5 rounded-lg hover:bg-red-50 transition-colors">
              删除记录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

// 模拟的试衣记录数据
const groupedRecords = ref({
  '今天': [
    {
      id: 1,
      title: '上衣试衣',
      time: '今天 14:30',
      type: '上半身',
      resultImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
      clothImage: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=400&fit=crop',
      personImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=300&fit=crop'
    },
    {
      id: 2,
      title: '全身搭配',
      time: '今天 10:15',
      type: '全身',
      resultImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop',
      clothImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
      personImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=300&fit=crop'
    }
  ],
  '昨天': [
    {
      id: 3,
      title: '裤子试衣',
      time: '昨天 16:45',
      type: '下半身',
      resultImage: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&h=400&fit=crop',
      clothImage: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&h=400&fit=crop',
      personImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=300&fit=crop'
    }
  ]
})

// 模态框状态
const showModal = ref(false)
const selectedRecord = ref(null)

// 显示详情
const showDetail = (record) => {
  selectedRecord.value = record
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  document.body.style.overflow = 'auto'
}

// 删除记录
const deleteRecord = () => {
  if (confirm('确定要删除这条记录吗？')) {
    // TODO: 实现删除逻辑
    closeModal()
  }
}

// 获取类型样式
const getTypeClass = (type) => {
  const classes = {
    '上半身': 'bg-blue-100 text-blue-500',
    '下半身': 'bg-purple-100 text-purple-500',
    '全身': 'bg-green-100 text-green-500'
  }
  return classes[type] || 'bg-gray-100 text-gray-500'
}
</script>

<style scoped>
.record-item {
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: none;
  z-index: 50;
  overflow-y: auto;
  padding: 20px 0;
}

.modal.active {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  margin: auto;
  overflow: hidden;
  max-height: initial;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
  border-bottom: 1px solid #F3F4F6;
}

.modal-body {
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 4px;
}

/* 自定义滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style> 