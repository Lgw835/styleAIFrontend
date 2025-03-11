<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <!-- 路由视图 -->
    <RouterView />
    
    <!-- 底部导航栏 -->
    <nav class="bottom-nav">
      <RouterLink to="/" class="nav-item" active-class="active">
        <i class="fas fa-tshirt"></i>
        <span>智能穿搭</span>
      </RouterLink>
      <RouterLink to="/wardrobe" class="nav-item" active-class="active">
        <i class="fas fa-box"></i>
        <span>衣柜</span>
      </RouterLink>
      <RouterLink to="/plaza" class="nav-item" active-class="active">
        <i class="fas fa-compass"></i>
        <span>广场</span>
      </RouterLink>
      <RouterLink to="/profile" class="nav-item" active-class="active">
        <i class="fas fa-user"></i>
        <span>我的</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f3f4f6;
  padding-bottom: 60px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #e5e7eb;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280;
  font-size: 0.75rem;
  text-decoration: none;
}

.nav-item i {
  font-size: 1.25rem;
  margin-bottom: 4px;
}

.nav-item.active {
  color: #3b82f6;
}
</style>
