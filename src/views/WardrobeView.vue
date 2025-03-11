<script setup>
const categories = [
  { value: '', label: '全部类别' },
  { value: 'tops', label: '上装' },
  { value: 'bottoms', label: '下装' },
  { value: 'dresses', label: '连衣裙' },
  { value: 'outerwear', label: '外套' },
  { value: 'shoes', label: '鞋子' },
  { value: 'accessories', label: '配饰' }
]

const colors = [
  { value: '', label: '全部颜色' },
  { value: 'white', label: '白色' },
  { value: 'black', label: '黑色' },
  { value: 'gray', label: '灰色' },
  { value: 'blue', label: '蓝色' },
  { value: 'red', label: '红色' },
  { value: 'pink', label: '粉色' },
  { value: 'beige', label: '米色' },
  { value: 'brown', label: '棕色' }
]

const seasons = [
  { value: '', label: '全部季节' },
  { value: 'spring', label: '春季' },
  { value: 'summer', label: '夏季' },
  { value: 'autumn', label: '秋季' },
  { value: 'winter', label: '冬季' },
  { value: 'all-season', label: '四季' }
]

const clothes = [
  {
    id: 1,
    name: '白色棉质衬衫',
    style: '商务风格',
    category: '商务 • 春秋',
    color: '白色',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: '黑色修身西装',
    style: '正装风格',
    category: '正装 • 四季',
    color: '黑色',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    name: '直筒牛仔裤',
    style: '休闲风格',
    category: '休闲 • 四季',
    color: '深蓝色',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    name: '白色运动鞋',
    style: '运动风格',
    category: '运动 • 春夏',
    color: '白色',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  }
]
</script>

<template>
  <div class="wardrobe">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-container">
        <h1 class="nav-title">我的衣柜</h1>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <div class="content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-container">
          <div class="select-container">
            <select class="filter-select">
              <option v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </div>

          <div class="select-container">
            <select class="filter-select">
              <option v-for="color in colors" :key="color.value" :value="color.value">
                {{ color.label }}
              </option>
            </select>
          </div>

          <div class="select-container">
            <select class="filter-select">
              <option v-for="season in seasons" :key="season.value" :value="season.value">
                {{ season.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 衣物网格 -->
      <div class="clothes-grid">
        <router-link 
          v-for="item in clothes" 
          :key="item.id"
          :to="`/wardrobe/${item.id}`" 
          class="clothes-item"
        >
          <div class="clothes-card">
            <div class="image-container">
              <img :src="item.image" :alt="item.name">
            </div>
            <div class="clothes-info">
              <div class="flex items-center justify-between">
                <h3 class="font-medium">{{ item.name }}</h3>
                <span class="style-tag">{{ item.style }}</span>
              </div>
              <p class="category">{{ item.category }}</p>
              <div class="color-info">
                <span class="color-dot" :class="item.color === '白色' ? 'border' : ''" 
                      :style="{ backgroundColor: item.color === '深蓝色' ? '#1e40af' : item.color }"></span>
                <span class="color-text">{{ item.color }}</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 浮动按钮组 -->
      <div class="float-buttons">
        <router-link to="/wardrobe/upload" class="float-button">
          <i class="fas fa-plus"></i>
        </router-link>
        <router-link to="/virtual-fitting" class="float-button">
          <i class="fas fa-tshirt"></i>
        </router-link>
        <router-link to="/fitting-history" class="float-button">
          <i class="fas fa-history"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wardrobe {
  padding-top: 56px;
  min-height: 100vh;
  background-color: #f3f4f6;
}

/* 顶部导航栏 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 20;
}

.nav-container {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  max-width: 640px;
  margin: 0 auto;
}

.nav-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  text-align: left;
}

.filter-bar {
  background: white;
  padding: 16px;
  position: sticky;
  top: 56px;
  z-index: 99;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.filter-container {
  display: flex;
  gap: 16px;
}

.select-container {
  flex: 1;
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  appearance: none;
  background-color: white;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  font-size: 14px;
  color: #374151;
}

.clothes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.clothes-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.image-container {
  position: relative;
  padding-bottom: 100%;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.clothes-info {
  padding: 12px;
}

.style-tag {
  font-size: 12px;
  color: #3b82f6;
}

.category {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.color-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 4px;
}

.color-dot.border {
  border: 1px solid #e5e7eb;
}

.color-text {
  font-size: 12px;
  color: #6b7280;
}

.float-buttons {
  position: fixed;
  bottom: 80px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.float-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style> 