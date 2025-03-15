<template>
  <div class="sub-page-nav-bar bg-white shadow-sm">
    <div class="container mx-auto px-4 h-14 flex items-center justify-between">
      <div class="flex items-center">
        <router-link :to="backLink" class="text-gray-500 mr-4">
          <i class="fas fa-chevron-left"></i>
        </router-link>
        <h1 class="text-lg font-medium">{{ title }}</h1>
      </div>
      
      <!-- 右侧额外操作区 -->
      <div>
        <slot name="right-action"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  backLink: {
    type: String,
    default: '/'
  }
})
</script>

<style scoped>
.sub-page-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
}
</style> 